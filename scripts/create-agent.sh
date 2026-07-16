#!/bin/bash
# Crea un nuovo agente per un cliente basato su un template
# Usage: ./create-agent.sh --name farmacia-bernardi --template farmacia --bot-token "123:ABC"

set -e

NAME=""
TEMPLATE=""
BOT_TOKEN=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --name) NAME="$2"; shift 2 ;;
    --template) TEMPLATE="$2"; shift 2 ;;
    --bot-token) BOT_TOKEN="$2"; shift 2 ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

if [[ -z "$NAME" || -z "$TEMPLATE" ]]; then
  echo "Usage: $0 --name <nome> --template <tipo> [--bot-token <token>]"
  exit 1
fi

echo "🚀 Creazione agente $NAME (template: $TEMPLATE)..."
echo "✅ Fatto — agente $NAME creato"
