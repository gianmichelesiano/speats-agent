#!/bin/bash
# ============================================================
# create-agent.sh — Crea un nuovo agente Hermes per un cliente
# 
# Pattern ripetibile: da questo script nasce ogni agente cliente
# ============================================================
set -e

# ─── Config ──────────────────────────────────────────────────
SPEATS_HOME="$HOME/.hermes"
TEMPLATES_DIR="$HOME/speats/templates"

# ─── Colori ───────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}✅${NC} $1"; }
warn() { echo -e "${YELLOW}⚠️ $1${NC}"; }
step() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

# ─── Parse argomenti ─────────────────────────────────────────
NAME=""
TEMPLATE="farmacia"  # default
BOT_TOKEN=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --name)       NAME="$2";      shift 2 ;;
    --template)   TEMPLATE="$2";  shift 2 ;;
    --bot-token)  BOT_TOKEN="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 --name <nome> [--template farmacia] [--bot-token <token>]"
      echo ""
      echo "Crea un agente Hermes dedicato per un cliente."
      echo "Il nome viene usato per: profilo Hermes, bot Telegram, cartella dati."
      exit 0 ;;
    *) echo "❌ Unknown: $1"; exit 1 ;;
  esac
done

if [[ -z "$NAME" ]]; then
  echo "❌ Usa: $0 --name farmacia-bernardi"
  exit 1
fi

TEMPLATE_DIR="$TEMPLATES_DIR/$TEMPLATE"
PROFILE_DIR="$SPEATS_HOME/profiles/$NAME"

# ─── 1. Verifica template ────────────────────────────────────
step "1/6 — Verifica template '$TEMPLATE'"
if [[ ! -d "$TEMPLATE_DIR" ]]; then
  echo "❌ Template '$TEMPLATE' non trovato in $TEMPLATE_DIR"
  exit 1
fi
if [[ ! -f "$TEMPLATE_DIR/template.config.yaml" ]]; then
  echo "❌ template.config.yaml mancante in $TEMPLATE_DIR"
  exit 1
fi
log "Template trovato: $TEMPLATE_DIR"

# ─── 2. Crea profilo Hermes ──────────────────────────────────
step "2/6 — Creazione profilo Hermes '$NAME'"
if [[ -d "$PROFILE_DIR" ]]; then
  warn "Profilo '$NAME' già esistente — sovrascrivo solo template files"
else
  hermes profile create "$NAME"
  log "Profilo creato: $NAME"
fi

# ─── 3. Copia template files ─────────────────────────────────
step "3/6 — Copia template files"
cp "$TEMPLATE_DIR/SOUL.md" "$PROFILE_DIR/SOUL.md" 2>/dev/null && log "SOUL.md copiato" || warn "SOUL.md mancante"
cp "$TEMPLATE_DIR/cron.md" "$PROFILE_DIR/cron.md" 2>/dev/null && log "cron.md copiato" || warn "cron.md mancante"
cp "$TEMPLATE_DIR/onboarding.md" "$PROFILE_DIR/onboarding.md" 2>/dev/null && log "onboarding.md copiato" || warn "onboarding.md mancante"

# ─── 4. API Key ──────────────────────────────────────────────
step "4/6 — Configura API key"
if [[ -f "$SPEATS_HOME/.env" ]]; then
  # Copia la API key dal profilo principale
  grep "DEEPSEEK_API_KEY" "$SPEATS_HOME/.env" > "$PROFILE_DIR/.env" 2>/dev/null && \
    log "API key copiata dal profilo principale" || \
    warn "Nessuna DEEPSEEK_API_KEY trovata"
else
  warn "Nessun .env trovato in $SPEATS_HOME"
fi

# ─── 5. Bot Telegram ─────────────────────────────────────────
step "5/6 — Configura Telegram"
if [[ -n "$BOT_TOKEN" ]]; then
  echo "TELEGRAM_BOT_TOKEN=$BOT_TOKEN" >> "$PROFILE_DIR/.env"
  log "Bot Telegram configurato"
else
  warn "Nessun --bot-token fornito. Dopo crealo con @BotFather e aggiungilo a:"
  warn "  echo 'TELEGRAM_BOT_TOKEN=123:ABC' >> $PROFILE_DIR/.env"
fi

# ─── 6. Applica restrizioni di sicurezza ────────────────────
step "6/7 — Applica restrizioni di sicurezza"
# Scrive la lista YAML corretta (hermes config set non supporta liste)
cat >> "$PROFILE_DIR/config.yaml" << 'YAML'
agent:
  disabled_toolsets:
    - terminal
    - skill_manage
    - write_file
    - patch
    - cronjob
    - process
    - delegate_task
    - ha_call_service
    - ha_get_state
    - ha_list_entities
    - ha_list_services
YAML
log "Tool pericolosi disabilitati"

# ─── 7. Attiva gateway ──────────────────────────────────────
step "7/7 — Attiva e avvia"
HERMES_HOME="$PROFILE_DIR" hermes config set gateway.enabled true 2>/dev/null
log "Gateway abilitato"

# Comando per avviare
echo ""
echo -e "${GREEN}═════════════════════════════════════════════════════${NC}"
echo -e "  🎉  Agente $NAME creato con successo!"
echo -e "${GREEN}═════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Profilo:${NC}     $PROFILE_DIR"
echo -e "  ${CYAN}Template:${NC}    $TEMPLATE"
echo -e "  ${CYAN}Tool pericolosi:${NC} disabilitati (terminal, write, cron...)"
echo ""
echo "  Avvia con:  toppharm-muhen gateway install && toppharm-muhen gateway start"
echo ""
echo "  Dopo il primo avvio, il cliente riceve un codice di pairing."
echo "  Autorizzalo con:  $NAME pairing approve telegram <CODICE>"
echo ""
