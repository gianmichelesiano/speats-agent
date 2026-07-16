# Architettura Speats

## Panoramica

```
┌──────────────────────────────────────────────────────┐
│                   SPEATS (server unico)              │
│                                                      │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│   │  Hermes      │  │  Odoo        │  │  Docker  │  │
│   │  Gateway     │  │  Dashboard   │  │  Registry│  │
│   │  (router)    │  │  + CRM       │  │          │  │
│   └──────┬───────┘  └──────────────┘  └──────────┘  │
│          │                                            │
│   ┌──────┴───────────────────────────────────────┐   │
│   │              Profili Clienti                  │   │
│   │                                               │   │
│   │   farmacia-bernardi/   farmacia-guidi/        │   │
│   │   ├── memories/        ├── memories/          │   │
│   │   ├── skills/          ├── skills/            │   │
│   │   ├── SOUL.md          ├── SOUL.md            │   │
│   │   ├── cron/            ├── cron/              │   │
│   │   └── .env (bot token) └── .env (bot token)   │   │
│   │                                               │   │
│   │   ristorante-qualita/  studio-rossi/          │   │
│   │   └── ...              └── ...                │   │
│   └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Stack

| Componente | Tecnologia |
|------------|------------|
| Agent platform | [Hermes Agent](https://hermes-agent.nousresearch.com) |
| Messaging | Telegram Bot API |
| Database profili | Filesystem + SQLite |
| Dashboard | Odoo 18 (CRM + Project) |
| Infrastruttura | Docker su Debian 12 |
| Hosting | Server dedicato (15GB RAM, 8 core) |

## Isolamento

Ogni profilo Hermes ha:
- ✅ Memoria separata (SQLite + GBrain per-cliente)
- ✅ Skills indipendenti (modificabili senza impattare altri)
- ✅ Bot Telegram dedicato
- ✅ Cron job propri
- ✅ SOUL.md personalizzato (personalità e contesto)

## Aggiornamenti

Templates centralizzati → distribuiti via script:

```bash
./scripts/update-templates.sh --template farmacia --version 2.1
```
