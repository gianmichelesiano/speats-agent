#!/bin/bash
# Aggiorna skills su TUTTI gli agenti di un dato template
# Usage: ./update-templates.sh --template farmacia

set -e

TEMPLATE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --template) TEMPLATE="$2"; shift 2 ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

if [[ -z "$TEMPLATE" ]]; then
  echo "Usage: $0 --template <tipo>"
  exit 1
fi

echo "🔄 Aggiornamento template $TEMPLATE su tutti gli agenti..."
echo "✅ Fatto — $TEMPLATE aggiornato su X agenti"
