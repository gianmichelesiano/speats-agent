# Speats 🤖

**Piattaforma AI multi-agent per il business.**

Speats è una piattaforma SaaS che permette di creare, gestire e monitorare agenti AI dedicati per ogni cliente. Ogni agente è un Hermes indipendente con skills, memoria e bot Telegram personalizzati.

## Linee di Business

| Area | Prodotto | Target |
|------|----------|--------|
| 💊 | **Pharma-Plan** | Farmacie svizzere (turni, triage, scadenze) |
| 📚 | **fph-prep** | Preparazione esame FPH per farmacisti |
| 🛠️ | **Consulenze dev** | Siti web, app, automazione per aziende |

## Come funziona

```
Cliente → Bot Telegram dedicato → Agente Hermes → Skills + Memoria → Risposta
```

Ogni cliente riceve:
- 🤖 **Bot Telegram** dedicato col nome della sua azienda
- 🧠 **Memoria persistente** — sa tutto del cliente
- 🔧 **Skills su misura** per il suo settore
- ⏰ **Cron job** automatici (report, check recensioni, scadenze)
- 📊 **Dashboard** centralizzata per Speats

## Architettura

Un server centralizzato, tanti profili Hermes isolati. Vedi `ARCHITECTURE.md`.

## Template disponibili

| Template | Cliente | SOUL | Security |
|----------|---------|------|----------|
| 💊 `farmacia` | TopPharm Muhen | Bilingue IT/DE, limiti assoluti | 🔒 Tool pericolosi bloccati |
| 🍝 `ristorante` | La Qualità | Bilingue IT/DE, limiti assoluti | 🔒 Tool pericolosi bloccati |

### Quick start
```bash
# Crea un nuovo agente
./scripts/create-agent.sh --name farmacia-xxxx --template farmacia --bot-token "..."

# Aggiorna tutti gli agenti di un template
./scripts/update-templates.sh --template farmacia

# Stato di tutti gli agenti
./scripts/health-check.sh
```

### Pattern
1. `create-agent.sh` → profilo + SOUL.md + security + gateway
2. Cliente scrive al bot → pairing → autorizzi
3. Cliente dice "impara dal nostro sito" → bot naviga, estrae, memorizza
4. Fatto — l'agente sa tutto del cliente

## Stato

🚧 Progetto in fase iniziale — MVP in sviluppo.
- ✅ Template farmacia (TopPharm Muhen)
- ✅ Template ristorante (La Qualità)
- ✅ Security (tool pericolosi disabilitati + limiti nel SOUL)
- ✅ Gateway systemd per ogni profilo
- ⬜ Onboarding automatico clienti
- ⬜ Dashboard centrale

## Speats Dashboard

La nuova dashboard operativa si trova in [`dashboard/`](dashboard/README.md). Usa React + FastAPI + PostgreSQL e rimane complementare a Odoo: gestione e osservabilità degli agenti qui, CRM e fatturazione in Odoo.

Per provarla con dati dimostrativi:

```bash
cd dashboard
npm install
VITE_DEMO_MODE=true npm run dev
```
