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

## Stato

🚧 Progetto in fase iniziale — MVP in sviluppo.
