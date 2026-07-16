from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, SecretStr


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class TokenUsage(ApiModel):
    today: int = 0
    week: int = 0
    month: int = 0


class CronJob(ApiModel):
    id: str
    name: str
    schedule: str
    enabled: bool = True
    last_run: datetime | None = None


class AgentResponse(ApiModel):
    name: str
    display_name: str
    template: str
    status: str
    provider: str
    telegram_username: str | None = None
    last_activity_at: datetime | None = None
    created_at: datetime
    token_usage: TokenUsage = Field(default_factory=TokenUsage)
    estimated_cost_month: float = 0
    soul: str | None = None
    cron_jobs: list[CronJob] = Field(default_factory=list)


class CreateAgentRequest(ApiModel):
    name: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", min_length=3, max_length=80)
    template: str = Field(min_length=2, max_length=80)
    telegram_token: SecretStr
    provider: str = Field(default="deepseek", max_length=80)


class TemplateResponse(ApiModel):
    name: str
    display_name: str
    description: str
    icon: str
    color: str
    language: str
    version: str
    agents_count: int = 0
    soul_preview: str
    files: list[str]


class LogResponse(ApiModel):
    id: str
    timestamp: datetime
    agent_name: str
    level: str
    message: str


class UsagePoint(ApiModel):
    date: str
    tokens: int


class DashboardResponse(ApiModel):
    agents: list[AgentResponse]
    recent_logs: list[LogResponse]
    usage: list[UsagePoint]
