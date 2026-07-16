# Speats Dashboard — Specifica Frontend React

## Repository
All'interno del repo `speats-agent`, cartella `dashboard/`.

```
speats-agent/
├── dashboard/              ← QUI la web app React
├── scripts/
├── templates/
└── ...
```

---

## 1. Concetto
Un pannello di controllo che mostra **tutti gli agenti Speats** in un colpo d'occhio e permette di **crearli, modificarli, monitorarli**. Pensato per girare sul server (localhost o Tailscale).

L'utente sei **tu (Gianmichele/Speats)** — non i clienti. È il tuo cockpit privato.

---

## 2. Pagine / Views

### 2.1 Dashboard — Home (`/`)
- **Card per ogni agente** con:
  - Nome profilo (es. `toppharm-muhen`, `laqualita`)
  - Stato: 🟢 Online / 🔴 Offline / ⚪ Non configurato
  - Template: 💊 farmacia / 🍝 ristorante
  - Ultima attività: "2 min fa"
  - Costo stimato (tokens consumati oggi/settimana/mese)
  - 🔗 Link diretto al bot Telegram

- **Riepilogo in alto:**
  - N° agenti totali
  - N° online
  - Costo totale del mese
  - Ultimi messaggi (log in tempo reale)

### 2.2 Dettaglio Agente (`/agent/:name`)
- **Info profilo:**
  - Nome, template, API provider (DeepSeek/OpenAI/Claude)
  - Bot Telegram username / link
  - Data creazione
  - Token consumati

- **SOUL.md** — lettura dal vivo
  - Mostra il contenuto attuale
  - ✏️ Editor inline (con preview Markdown)
  - Bottone "Salva" (patcha il file sul server)

- **Logs** — ultime N righe del gateway
  - Output di `journalctl --user -u hermes-gateway-<nome> --no-pager -n 50`
  - Auto-refresh ogni 5 secondi

- **Azioni rapide:**
  - 🔄 Riavvia gateway
  - 🔌 Disconnetti Telegram
  - 📋 Copia pairing code

- **Cron jobs** attivi per questo agente
  - Lista dei job programmati
  - Esegui manualmente
  - Disabilita/abilita

### 2.3 Template Management (`/templates`)
- **Lista template** (farmacia, ristorante)
- Per ogni template:
  - Anteprima SOUL.md
  - `template.config.yaml` (visualizzazione + edit)
  - `cron.md`
  - `onboarding.md`
  - Bottone "Applica a nuovo agente"

### 2.4 Creazione Agente (`/agent/new`)
- Form guidato:
  1. **Nome profilo** (es. `farmacia-bernardi`)
  2. **Template** (dropdown: farmacia / ristorante)
  3. **Token Telegram** (da @BotFather)
  4. **Anteprima configurazione** (mostra SOUL.md + security)
  5. **Bottone "Crea"** → esegue `create-agent.sh` in background
  6. Mostra log live della creazione

### 2.5 Logs Globali (`/logs`)
- **Feed live** dei messaggi di TUTTI gli agenti
- Filtrabile per agente, livello (INFO/WARN/ERROR)
- Ricerca testo
- Timer "ricarica ogni N secondi"

### 2.6 Template Editor (`/templates/:name/edit`)
- Editor per SOUL.md (Markdown con preview)
- Editor YAML per `template.config.yaml`
- Upload immagini (logo template)
- Bottone "Salva & Pusha" (commit + push su GitHub)

---

## 3. API Backend

La dashboard ha bisogno di un backend leggero che parli col server. Puoi scegliere:

### Opzione A — API Python (FastAPI)
Piccolo server FastAPI che gira accanto a Hermes, espone:

```
GET    /api/agents                    ← Lista agenti + stato
GET    /api/agents/:name              ← Dettaglio agente
GET    /api/agents/:name/soul         ← SOUL.md
PATCH  /api/agents/:name/soul         ← Aggiorna SOUL.md
POST   /api/agents/:name/restart      ← Riavvia gateway
GET    /api/agents/:name/logs         ← Log gateway
POST   /api/agents                    ← Crea agente (lancia script)
GET    /api/agents/:name/stats        ← Token/costi

GET    /api/templates                 ← Lista template
GET    /api/templates/:name           ← Dettaglio template
PUT    /api/templates/:name           ← Aggiorna template
POST   /api/templates/:name/deploy    ← Applica a tutti gli agenti

GET    /api/logs                      ← Log globali
```

### Opzione B — Proxy SSH (solo frontend)
La dashboard è solo frontend React, e usa SSH per connettersi al server ed eseguire comandi direttamente. Più semplice ma meno potente.

---

## 4. Architettura Tecnica

```
┌──────────────────────────────┐
│   React App (Vite)           │
│   localhost:5173             │
│                              │
│  ┌─────┐ ┌──────┐ ┌───────┐ │
│  │Home │ │Agent │ │Templ. │ │
│  │     │ │Detail│ │Manage │ │
│  └─────┘ └──────┘ └───────┘ │
└──────────┬───────────────────┘
           │ HTTP/REST
┌──────────▼───────────────────┐
│   FastAPI Backend             │
│   localhost:8000              │
│                              │
│  ┌──────────┐ ┌───────────┐  │
│  │ Agent API│ │Template   │  │
│  │          │ │API        │  │
│  └──────────┘ └───────────┘  │
└──────────┬───────────────────┘
           │ Subprocess / Systemd
┌──────────▼───────────────────┐
│   Hermes Profiles            │
│   ~/.hermes/profiles/*/      │
│   + systemd services         │
└──────────────────────────────┘
```

### Stack suggerito:
| Cosa | Tecnologia |
|------|-----------|
| Frontend | React + Vite + TypeScript |
| Routing | React Router v6 |
| UI Kit | shadcn/ui (Tailwind) |
| Stato | React Query (TanStack Query) |
| Grafici | Recharts |
| HTTP client | fetch + React Query |
| Backend | FastAPI (Python) |
| Auth | HTTP Basic + Tailscale (solo rete locale) |

---

## 5. Dati da mostrare per ogni agente

| Campo | Fonte |
|-------|-------|
| Nome | `~/.hermes/profiles/<nome>/` |
| Stato gateway | `systemctl --user is-active hermes-gateway-<nome>` |
| Template | Dal `SOUL.md` (sezione Identità) o `template.config.yaml` |
| Bot Telegram | `TELEGRAM_BOT_TOKEN` nel `.env` → username via API Telegram |
| Ultimo messaggio | `journalctl` ultime righe |
| Token consumati dal vivo | Non direttamente accessibile; si può estimare |
| SOUL.md | Lettura file |
| Cron jobs | `hermes cron list -p <nome>` |

---

## 6. UX / Design

- **Sidebar** con: Dashboard | Agenti | Template | Logs
- **Tema scuro** (fatto per developer)
- **Header** con: ultimo aggiornamento, refresh button
- **Cards** per agenti con stato colorato (verde/rosso/grigio)
- **Log in tempo reale** tipo `journalctl -f`
- **Editor Markdown** per SOUL.md (tipo CodeMirror o Monaco)

---

## 7. V1 — MVP

### Deve avere:
1. Dashboard con card agenti + stato
2. Dettaglio agente (info + SOUL in lettura)
3. Pagina template in lettura
4. Form creazione agente (nome + template + token)
5. Logs globali in tempo reale
6. Refresh manuale / auto-refresh

### Può aspettare:
- ✏️ Editor SOUL inline
- 🏗️ Editor template
- 📊 Grafici costi
- 🔄 Auto-refresh WebSocket
- 🚀 Deploy con Docker

---

## 8. Backend FastAPI (suggerito)

Un file solo: `dashboard/api.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess, json, os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)

HERMES_HOME = os.path.expanduser("~/.hermes/profiles")

@app.get("/api/agents")
def list_agents():
    profiles = os.listdir(HERMES_HOME)
    agents = []
    for p in profiles:
        status = subprocess.run(
            ["systemctl", "--user", "is-active", f"hermes-gateway-{p}"],
            capture_output=True, text=True
        ).stdout.strip()
        agents.append({"name": p, "status": status})
    return agents

@app.get("/api/agents/{name}/soul")
def get_soul(name: str):
    path = f"{HERMES_HOME}/{name}/SOUL.md"
    if os.path.exists(path):
        return {"content": open(path).read()}
    return {"error": "not found"}, 404
```

---

## 9. Attenzioni

- **Sicurezza:** la dashboard DEVE stare solo su LAN/Tailscale. Nessuna esposizione pubblica.
- **File system:** le API leggono/scrivono file sul server. Validare sempre i path.
- **Systemd:** riavviare gateway richiede permessi user — funziona via `systemctl --user`.
- **Token Telegram:** mai mostrarli in chiaro nell'interfaccia.
- **Script background:** `create-agent.sh` può impiegare 10-30 secondi — usare polling o WebSocket.

---

## 10. Integrazione repo

```
speats-agent/
├── dashboard/
│   ├── src/               ← React app
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── App.tsx
│   ├── api.py             ← Backend FastAPI
│   ├── package.json
│   └── README.md
├── templates/
├── scripts/
└── ...
```

---

## 11. Come iniziare

1. `cd speats-agent && mkdir dashboard && cd dashboard`
2. `npm create vite@latest . -- --template react-ts`
3. Installa dipendenze: `react-router-dom`, `@tanstack/react-query`, `tailwindcss`, `shadcn/ui`
4. Crea `api.py` con FastAPI
5. Implementa pagina Dashboard → Agenti → Template → Creazione

---

*Documento generato il 16/07/2026 — Speats Dashboard v0.1*
