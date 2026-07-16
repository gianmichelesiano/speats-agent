# Template: Farmacia

## Cosa ottieni

Un agente AI dedicato per una farmacia svizzera con:
- 🤖 **Bot Telegram** — il farmacista parla col suo assistente
- 💊 **DB farmaci** (Swissmedic + OpenFDA) — ricerca, interazioni, scadenze
- 🏥 **Triage** — 29 algoritmi di auto-cura
- 💉 **VaxCheck** — verifica copertura vaccinale
- 📋 **Pharma-Plan** — gestione turni

## Come creare un nuovo agente farmacia

### 1. Crea il bot Telegram
Apri @BotFather su Telegram:
```
/newbot
Nome: Farmacia Bernardi Assistant
Username: FarmaciaBernardiBot
```
Salva il token che ricevi.

### 2. Lancia lo script
```bash
./scripts/create-agent.sh \
  --name farmacia-bernardi \
  --template farmacia \
  --bot-token "1234567890:ABCdef..."
```

### 3. Avvia
```bash
farmacia-bernardi gateway start
```

### 4. Autorizza il cliente
Il cliente scrive al bot, riceve un codice pairing. Tu autorizzi:
```bash
farmacia-bernardi pairing approve telegram <CODICE>
```

### 5. Fatto! 🎉
Il farmacista ora parla col suo agente.

## Aggiornare tutti gli agenti farmacia
```bash
# Modifichi il template, poi:
./scripts/update-templates.sh --template farmacia
```

## Struttura template
```
templates/farmacia/
├── template.config.yaml   ← Config machine-readable
├── SOUL.md                ← Personalità agente
├── skills.md              ← Skills da installare
├── cron.md                ← Job automatici
├── onboarding.md          ← Checklist setup cliente
└── README.md              ← Questa guida
```
