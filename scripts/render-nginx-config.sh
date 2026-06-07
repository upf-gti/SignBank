#!/usr/bin/env bash
# Render production nginx config from BASE_URL in .env
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE="$ROOT/nginx/nginx.prod.conf/default.conf.template"
OUTPUT="$ROOT/nginx/nginx.prod.conf/default.conf"

if [ ! -f "$TEMPLATE" ]; then
  echo "Missing template: $TEMPLATE"
  exit 1
fi

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

export SERVER_NAME="${BASE_URL:-localhost}"

if command -v envsubst >/dev/null 2>&1; then
  envsubst '${SERVER_NAME}' < "$TEMPLATE" > "$OUTPUT"
else
  sed "s/\${SERVER_NAME}/${SERVER_NAME}/g" "$TEMPLATE" > "$OUTPUT"
fi

echo "Rendered nginx config for server_name=${SERVER_NAME} -> $OUTPUT"
