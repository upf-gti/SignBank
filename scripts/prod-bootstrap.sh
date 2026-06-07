#!/usr/bin/env bash
# First-time server setup for manual production deploy (not Dockploy)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

echo "=== SignBank production bootstrap ==="

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is required."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: Docker Compose v2 is required."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit secrets before deploying."
else
  echo ".env already exists — skipping copy."
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

mkdir -p FileServer/gloss-videos FileServer/example-videos FileServer/definition-videos
mkdir -p backend/backups nginx/certs
echo "Created FileServer/ and backup directories."

CERT_CRT="nginx/certs/server.crt"
CERT_KEY="nginx/certs/server.key"
CN="${BASE_URL:-localhost}"

if [ ! -f "$CERT_CRT" ] || [ ! -f "$CERT_KEY" ]; then
  if command -v openssl >/dev/null 2>&1; then
    echo "Generating self-signed SSL certificate for CN=${CN}..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "$CERT_KEY" -out "$CERT_CRT" \
      -subj "/CN=${CN}"
    echo "Certificates written to nginx/certs/"
  else
    echo "Warning: openssl not found. Place server.crt and server.key in nginx/certs/"
  fi
else
  echo "SSL certificates already present in nginx/certs/"
fi

bash "$SCRIPT_DIR/render-nginx-config.sh"

echo ""
echo "=== Bootstrap complete ==="
echo "Next steps:"
echo "  1. Edit .env (JWT_SECRET, passwords, BASE_URL)"
echo "  2. Run: bash scripts/deploy.sh prod"
echo ""
echo "For Dockploy test instead: configure docker-compose.dockploy.yaml in Dockploy UI."
