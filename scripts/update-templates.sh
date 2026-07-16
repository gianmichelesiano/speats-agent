#!/bin/bash
# ============================================================
# update-templates.sh — Aggiorna skills/SOUL su TUTTI gli agenti
# di un dato template. Pattern: modifica template, pusha su tutti.
# ============================================================
set -e

SPEATS_HOME="$HOME/.hermes"
TEMPLATES_DIR="$HOME/speats/templates"

TEMPLATE=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --template) TEMPLATE="$2"; shift 2 ;;
    --dry-run)  DRY_RUN=true;  shift ;;
    --help|-h)
      echo "Usage: $0 --template farmacia [--dry-run]"
      echo ""
      echo "Copia i file del template su TUTTI i profili Hermes che usano quel template."
      echo "Cerca nel SOUL.md di ogni profilo per capire di che template è."
      exit 0 ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

if [[ -z "$TEMPLATE" ]]; then
  echo "❌ Usa: $0 --template farmacia"
  exit 1
fi

TEMPLATE_DIR="$TEMPLATES_DIR/$TEMPLATE"
echo "🔍 Cerco profili che usano il template '$TEMPLATE'..."

# Trova profili che hanno SOUL.md simile al template
MATCHES=()
for profile in "$SPEATS_HOME/profiles"/*/; do
  name=$(basename "$profile")
  if [[ -f "$profile/SOUL.md" ]] && grep -q "Template: $TEMPLATE\|$TEMPLATE" "$profile/SOUL.md" 2>/dev/null; then
    MATCHES+=("$name")
  fi
done

if [[ ${#MATCHES[@]} -eq 0 ]]; then
  # Fallback: mostra tutti i profili
  echo "⚠️  Nessun profilo marcato con template '$TEMPLATE' trovato."
  echo "   Profili disponibili:"
  for profile in "$SPEATS_HOME/profiles"/*/; do
    name=$(basename "$profile")
    echo "   - $name"
  done
  exit 0
fi

echo "📋 Trovati ${#MATCHES[@]} agenti: ${MATCHES[*]}"

if [[ "$DRY_RUN" == true ]]; then
  echo "🏁 Dry-run: nessuna modifica applicata."
  exit 0
fi

# Applica aggiornamenti
for agent in "${MATCHES[@]}"; do
  echo "  → $agent..."
  cp "$TEMPLATE_DIR/SOUL.md" "$SPEATS_HOME/profiles/$agent/SOUL.md" 2>/dev/null
  # Skills: le nuove skills vanno installate a parte
  echo "    ✅ SOUL.md aggiornato"
done

echo ""
echo "🎉 $TEMPLATE aggiornato su ${#MATCHES[@]} agenti."
echo "   Skills nuove vanno installate manualmente con:"
echo "   HERMES_HOME=... hermes skills install <nome>"
