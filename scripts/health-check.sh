#!/bin/bash
# ============================================================
# health-check.sh — Mostra status di tutti gli agenti clienti
# ============================================================
set -e

SPEATS_HOME="$HOME/.hermes/profiles"
TOTAL=0
ONLINE=0
OFFLINE=0

echo "╔══════════════════════════════════════════╗"
echo "║       🏥 Health Check — Speats          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

for profile in "$SPEATS_HOME"/*/; do
  name=$(basename "$profile")
  TOTAL=$((TOTAL + 1))
  
  # Check gateway status via systemd
  if systemctl --user is-active "hermes-$name" &>/dev/null 2>&1; then
    echo "  ✅ $name    Online"
    ONLINE=$((ONLINE + 1))
  elif [[ -f "$profile/.env" ]] && grep -q "TELEGRAM_BOT_TOKEN" "$profile/.env" 2>/dev/null; then
    echo "  ⚠️  $name    Configurato ma fermo"
  else
    echo "  ⬜ $name    Non configurato"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 $TOTAL profili  |  ✅ $ONLINE online"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  💡 Avvia un agente fermo:"
echo "     <nome-profilo> gateway start"
