from collections.abc import Iterator
from contextlib import asynccontextmanager
from datetime import date, timedelta
from uuid import UUID

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .auth import require_auth
from .config import get_settings
from .database import Base, SessionLocal, engine, get_db
from .hermes import HermesError, HermesService
from .models import (
    ActivityEvent,
    Agent,
    AgentStatus,
    AuditEvent,
    EventLevel,
    ProvisionJob,
    Server,
    UsageDaily,
    utcnow,
)
from .schemas import (
    AgentResponse,
    CreateAgentRequest,
    CronJob,
    DashboardResponse,
    LogResponse,
    TemplateResponse,
    TokenUsage,
    UsagePoint,
)

settings = get_settings()
hermes = HermesService(settings)


@asynccontextmanager
async def lifespan(_: FastAPI) -> Iterator[None]:
    if settings.auto_create_schema:
        Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        ensure_server(db)
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT"],
    allow_headers=["Authorization", "Content-Type"],
)


def ensure_server(db: Session) -> Server:
    server = db.get(Server, settings.server_id)
    if server is None:
        server = Server(id=settings.server_id, name=settings.server_name)
        db.add(server)
        db.commit()
    return server


def sync_profiles(db: Session) -> None:
    ensure_server(db)
    known = {agent.name: agent for agent in db.scalars(select(Agent)).all()}
    changed = False
    for name in hermes.discover_profiles():
        live_status = hermes.status(name)
        if name not in known:
            db.add(
                Agent(
                    server_id=settings.server_id,
                    name=name,
                    display_name=name.replace("-", " ").title(),
                    template_name=name.split("-", 1)[0],
                    status=live_status,
                )
            )
            changed = True
        elif known[name].status != live_status:
            known[name].status = live_status
            changed = True
    if changed:
        db.commit()


def usage_for_agent(db: Session, agent_id: UUID) -> tuple[TokenUsage, float]:
    today = date.today()
    month_start = today.replace(day=1)

    def total_since(start: date) -> tuple[int, float]:
        row = db.execute(
            select(
                func.coalesce(func.sum(UsageDaily.input_tokens + UsageDaily.output_tokens), 0),
                func.coalesce(func.sum(UsageDaily.estimated_cost_chf), 0.0),
            ).where(UsageDaily.agent_id == agent_id, UsageDaily.day >= start)
        ).one()
        return int(row[0]), float(row[1])

    today_total, _ = total_since(today)
    week_total, _ = total_since(today - timedelta(days=6))
    month_total, month_cost = total_since(month_start)
    return TokenUsage(today=today_total, week=week_total, month=month_total), month_cost


def serialize_agent(db: Session, agent: Agent, include_detail: bool = False) -> AgentResponse:
    usage, cost = usage_for_agent(db, agent.id)
    return AgentResponse(
        name=agent.name,
        display_name=agent.display_name,
        template=agent.template_name,
        status=agent.status.value,
        provider=agent.provider,
        telegram_username=agent.telegram_username,
        last_activity_at=agent.last_activity_at,
        created_at=agent.created_at,
        token_usage=usage,
        estimated_cost_month=cost,
        soul=hermes.read_soul(agent.name) if include_detail else None,
        cron_jobs=[CronJob(**job) for job in hermes.cron_jobs(agent.name)] if include_detail else [],
    )


def serialize_log(event: ActivityEvent) -> LogResponse:
    return LogResponse(
        id=str(event.id),
        timestamp=event.created_at,
        agent_name=event.agent.name if event.agent else event.server_id,
        level=event.level.value,
        message=event.message,
    )


def provision_agent(job_id: UUID, token: str) -> None:
    with SessionLocal() as db:
        job = db.get(ProvisionJob, job_id)
        if job is None:
            return
        agent = db.get(Agent, job.agent_id)
        if agent is None:
            return
        job.status = "running"
        db.commit()
        try:
            job.output = hermes.provision(agent.name, agent.template_name, token)
            job.status = "complete"
            agent.status = hermes.status(agent.name)
            level, message = EventLevel.info, "Provisioning completed"
        except HermesError as exc:
            job.output = str(exc)
            job.status = "failed"
            level, message = EventLevel.error, f"Provisioning failed: {exc}"
        job.finished_at = utcnow()
        db.add(
            ActivityEvent(
                agent_id=agent.id, server_id=agent.server_id, level=level, source="provision", message=message
            )
        )
        db.commit()


auth = Depends(require_auth)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "database": "postgresql"}


@app.get(f"{settings.api_prefix}/agents", response_model=list[AgentResponse], dependencies=[auth])
def list_agents(db: Session = Depends(get_db)) -> list[AgentResponse]:
    sync_profiles(db)
    agents = db.scalars(select(Agent).order_by(Agent.created_at.desc())).all()
    return [serialize_agent(db, agent) for agent in agents]


@app.get(f"{settings.api_prefix}/agents/{{name}}", response_model=AgentResponse, dependencies=[auth])
def get_agent(name: str, db: Session = Depends(get_db)) -> AgentResponse:
    agent = db.scalar(select(Agent).where(Agent.name == name))
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    live_status = hermes.status(agent.name)
    if live_status != agent.status:
        agent.status = live_status
        db.commit()
    return serialize_agent(db, agent, include_detail=True)


@app.post(f"{settings.api_prefix}/agents", status_code=202, dependencies=[auth])
def create_agent(
    payload: CreateAgentRequest,
    tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    if db.scalar(select(Agent).where(Agent.name == payload.name)):
        raise HTTPException(status_code=409, detail="Agent already exists")
    if not (settings.templates_dir / payload.template).is_dir():
        raise HTTPException(status_code=400, detail="Unknown template")
    ensure_server(db)
    agent = Agent(
        server_id=settings.server_id,
        name=payload.name,
        display_name=payload.name.replace("-", " ").title(),
        template_name=payload.template,
        provider=payload.provider,
        status=AgentStatus.unconfigured,
    )
    db.add(agent)
    db.flush()
    job = ProvisionJob(agent_id=agent.id)
    db.add(job)
    db.add(
        AuditEvent(
            action="agent.create",
            target_type="agent",
            target_id=payload.name,
            detail=f"template={payload.template}",
        )
    )
    db.commit()
    tasks.add_task(provision_agent, job.id, payload.telegram_token.get_secret_value())
    return {"name": payload.name, "status": "provisioning"}


@app.get(f"{settings.api_prefix}/agents/{{name}}/soul", dependencies=[auth])
def get_soul(name: str) -> dict[str, str]:
    soul = hermes.read_soul(name)
    if soul is None:
        raise HTTPException(status_code=404, detail="SOUL.md not found")
    return {"content": soul}


@app.patch(f"{settings.api_prefix}/agents/{{name}}/soul", dependencies=[auth])
def patch_soul(name: str, payload: dict[str, str], db: Session = Depends(get_db)) -> dict[str, str]:
    content = payload.get("content", "")
    if not content.strip() or len(content) > 250_000:
        raise HTTPException(status_code=400, detail="Invalid SOUL.md content")
    try:
        hermes.write_soul(name, content)
    except HermesError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    db.add(AuditEvent(action="agent.soul.update", target_type="agent", target_id=name))
    db.commit()
    return {"status": "saved"}


@app.post(f"{settings.api_prefix}/agents/{{name}}/restart", status_code=202, dependencies=[auth])
def restart_agent(name: str, db: Session = Depends(get_db)) -> dict[str, str]:
    agent = db.scalar(select(Agent).where(Agent.name == name))
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    try:
        hermes.restart(name)
    except HermesError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    db.add(AuditEvent(action="agent.restart", target_type="agent", target_id=name))
    db.add(ActivityEvent(agent_id=agent.id, server_id=agent.server_id, message="Gateway restart requested"))
    db.commit()
    return {"status": "restarting"}


@app.get(f"{settings.api_prefix}/templates", response_model=list[TemplateResponse], dependencies=[auth])
def list_templates(db: Session = Depends(get_db)) -> list[TemplateResponse]:
    counts = dict(db.execute(select(Agent.template_name, func.count()).group_by(Agent.template_name)).all())
    return [
        TemplateResponse(**template, agents_count=counts.get(template["name"], 0))
        for template in hermes.templates()
    ]


@app.get(f"{settings.api_prefix}/logs", response_model=list[LogResponse], dependencies=[auth])
def list_logs(db: Session = Depends(get_db)) -> list[LogResponse]:
    events = db.scalars(select(ActivityEvent).order_by(ActivityEvent.created_at.desc()).limit(200)).all()
    return [serialize_log(event) for event in events]


@app.get(f"{settings.api_prefix}/dashboard", response_model=DashboardResponse, dependencies=[auth])
def dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    sync_profiles(db)
    agents = db.scalars(select(Agent).order_by(Agent.created_at.desc())).all()
    events = db.scalars(select(ActivityEvent).order_by(ActivityEvent.created_at.desc()).limit(12)).all()
    start = date.today() - timedelta(days=6)
    rows = db.execute(
        select(UsageDaily.day, func.sum(UsageDaily.input_tokens + UsageDaily.output_tokens))
        .where(UsageDaily.day >= start)
        .group_by(UsageDaily.day)
        .order_by(UsageDaily.day)
    ).all()
    by_day = {day: int(total) for day, total in rows}
    usage = [
        UsagePoint(
            date=(start + timedelta(days=offset)).strftime("%d %b").lower(),
            tokens=by_day.get(start + timedelta(days=offset), 0),
        )
        for offset in range(7)
    ]
    return DashboardResponse(
        agents=[serialize_agent(db, agent) for agent in agents],
        recent_logs=[serialize_log(event) for event in events],
        usage=usage,
    )
