# Speats Dashboard

Cockpit operativo privato per creare, monitorare e gestire gli agenti Hermes di Speats. La dashboard è complementare a Odoo: qui vivono operazioni, configurazione e osservabilità degli agenti; CRM e fatturazione restano in Odoo.

## Architettura

- **Frontend:** React, TypeScript, Vite, TanStack Query, Recharts
- **API:** FastAPI e SQLAlchemy
- **Database:** PostgreSQL 17 con migrazioni Alembic
- **Runtime:** profili Hermes sul filesystem e unit user systemd
- **Accesso:** rete Tailscale; Basic Auth opzionale come secondo livello

PostgreSQL conserva metadati, consumi, job, eventi e audit. `~/.hermes/profiles` e systemd restano le sorgenti operative. Ogni record agente contiene un `server_id`, così la V1 lavora su un server ma lo schema è già pronto per l'orchestrazione multi-server.

## Requisiti

- Node.js 22 o successivo
- Python 3.12 o 3.13
- [uv](https://docs.astral.sh/uv/)
- Docker con Compose, oppure un PostgreSQL 15+
- Hermes installato sul server per le operazioni reali

## Installazione locale

### 1. PostgreSQL

```bash
cd dashboard
docker compose up -d postgres
```

Se la porta `5432` è già occupata:

```bash
POSTGRES_PORT=5433 docker compose up -d postgres
```

In quel caso usa `localhost:5433` anche in `DATABASE_URL`.

### 2. Backend FastAPI

```bash
cd dashboard/backend
cp .env.example .env
uv sync --python 3.13
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Verifica:

```bash
curl http://127.0.0.1:8000/health
```

La risposta deve includere `"database":"postgresql"`.

### 3. Frontend React

In un secondo terminale:

```bash
cd dashboard
cp .env.example .env
npm install
npm run dev
```

Apri `http://127.0.0.1:5173`.

Per esplorare l'interfaccia senza profili Hermes o API:

```bash
VITE_DEMO_MODE=true npm run dev
```

La modalità demo contiene solo fixture nel browser e non sostituisce PostgreSQL nel backend reale.

## Configurazione server

Nel file `dashboard/backend/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg://speats:password-forte@127.0.0.1:5432/speats
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=password-lunga-e-casuale
HERMES_PROFILES_DIR=/home/speats/.hermes/profiles
SERVER_ID=speats-01
SYSTEMD_UNIT_TEMPLATE=hermes-gateway-{name}
SPEATS_EXECUTE_COMMANDS=true
CORS_ORIGINS=http://127.0.0.1:5173
AUTO_CREATE_SCHEMA=false
```

Note importanti:

- lascia `SPEATS_EXECUTE_COMMANDS=false` durante sviluppo e test;
- attivalo solo sul server Speats, con lo stesso utente che gestisce le unit Hermes;
- il token Telegram passa al provisioning tramite environment e non viene salvato nel database o nell'audit;
- il backend valida ogni nome profilo e impedisce path traversal;
- usa Alembic (`uv run alembic upgrade head`) in produzione; `AUTO_CREATE_SCHEMA` è solo una comodità locale.

## Tailscale e pubblicazione

Il backend deve girare sul server host, non dentro Docker, perché deve raggiungere user systemd e i profili Hermes. Una configurazione consigliata è:

1. frontend compilato con `npm run build`;
2. `dashboard/dist` servita da Caddy o Nginx;
3. `/api/*` inoltrato a `127.0.0.1:8000`;
4. virtual host in ascolto esclusivamente sull'indirizzo Tailscale;
5. Basic Auth sul reverse proxy, oltre alla protezione opzionale dell'API.

Non esporre la dashboard su Internet pubblico.

## Comandi utili

```bash
# Build frontend
npm run build

# Qualità backend
cd backend
uv run ruff check .

# Nuova migrazione dopo una modifica ai modelli
uv run alembic revision --autogenerate -m "descrizione"
uv run alembic upgrade head

# Fermare il database locale
cd ..
docker compose down
```

## API principali

- `GET /api/dashboard`
- `GET /api/agents`
- `GET /api/agents/{name}`
- `POST /api/agents`
- `POST /api/agents/{name}/restart`
- `GET/PATCH /api/agents/{name}/soul`
- `GET /api/templates`
- `GET /api/logs`

La documentazione OpenAPI è disponibile su `http://127.0.0.1:8000/docs` durante lo sviluppo.
