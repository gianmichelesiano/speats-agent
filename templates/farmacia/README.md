# Template: Farmacia

## Cosa ottieni

Un agente AI sicuro e dedicato per una farmacia svizzera con:
- 🤖 **Bot Telegram** — il farmacista parla col suo assistente
- 💊 **Ricerca farmaci** (Swissmedic + OpenFDA)
- 🏥 **Triage** — 29 algoritmi di auto-cura
- 🌐 **Auto-apprendimento** — naviga il sito del cliente e impara
- 🔒 **Sicuro** — non può modificare se stesso, eseguire comandi, o creare cron

## Pattern di auto-apprendimento

L'agente NON ha dati precompilati. Impara da solo dal sito web del cliente:

```
Cliente: "Vai sul nostro sito e impara tutto di noi"
Agente: → naviga il sito → estrae info → salva in memoria → le usa per sempre
```

Questo è il pattern chiave: **un template, tante farmacie, ognuna impara da sola.**

## Sicurezza

Ogni agente cliente ha i tool pericolosi **disabilitati**:

| Bloccato | Perché |
|----------|--------|
| `terminal` | Eseguire comandi shell |
| `skill_manage` | Modificare skills |
| `write_file` / `patch` | Scrivere file |
| `cronjob` | Creare automazioni |
| `delegate_task` | Generare sub-agenti |

Solo tu (Speats) hai accesso completo.

## Come creare un nuovo agente farmacia

### 1. Crea il bot Telegram
Apri @BotFather su Telegram:
```
/newbot
Nome: Farmacia Bernardi Assistant
Username: FarmaciaBernardiBot
```
Salva il token.

### 2. Lancia lo script
```bash
./scripts/create-agent.sh \
  --name farmacia-bernardi \
  --template farmacia \
  --bot-token "1234567890:ABCdef..."
```

### 3. Avvia
```bash
farmacia-bernardi gateway install
farmacia-bernardi gateway start
```

### 4. Autorizza il cliente
Il cliente scrive al bot, riceve un codice pairing. Tu autorizzi:
```bash
farmacia-bernardi pairing approve telegram <CODICE>
```

### 5. Il cliente dice "impara dal nostro sito" 🎯
L'agente naviga il sito, estrae orari, team, servizi, e se li ricorda.

## Aggiornare tutti gli agenti farmacia
```bash
./scripts/update-templates.sh --template farmacia
```

## Struttura template
```
templates/farmacia/
├── template.config.yaml   ← Config (skills, security, cron, MCP)
├── SOUL.md                ← Personalità + pattern auto-apprendimento
├── skills.md              ← Skills da installare
├── cron.md                ← Job automatici
├── onboarding.md          ← Checklist setup cliente
└── README.md              ← Questa guida
```
