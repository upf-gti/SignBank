#!/usr/bin/env bash
# Build and deploy SignBank (production or Dockploy compose)
# Usage: bash scripts/deploy.sh [prod|dockploy]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

ENV="${1:-prod}"

load_env() {
  if [ ! -f .env ]; then
    echo "Missing .env — run: bash scripts/prod-bootstrap.sh"
    exit 1
  fi
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
}

validate_env() {
  local missing=()
  for var in BASE_URL POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET TYPESENSE_API_KEY; do
    if [ -z "${!var:-}" ]; then
      missing+=("$var")
    fi
  done
  if [ "${#missing[@]}" -gt 0 ]; then
    echo "Missing required .env variables: ${missing[*]}"
    exit 1
  fi
  if [ "${#JWT_SECRET}" -lt 32 ]; then
    echo "JWT_SECRET must be at least 32 characters."
    exit 1
  fi
}

backup_database() {
  local backup_file="backend/backups/pre_deploy_$(date +%Y%m%d_%H%M%S).sql"
  mkdir -p backend/backups
  echo "Creating pre-deploy backup: $backup_file"
  if docker compose -f docker-compose-production.yaml ps postgres 2>/dev/null | grep -qE 'Up|running'; then
    docker compose -f docker-compose-production.yaml exec -T postgres \
      pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB:-signbank_prod}" > "$backup_file"
    echo "Backup saved."
  else
    echo "Postgres not running — skipping backup (first deploy?)."
  fi
}

wait_for_backend() {
  local compose_cmd=("$@")
  echo "Waiting for backend to be ready..."
  local attempt
  for attempt in $(seq 1 40); do
    if "${compose_cmd[@]}" exec -T backend npx prisma migrate status >/dev/null 2>&1; then
      echo "Backend is ready."
      return 0
    fi
    sleep 3
  done
  echo "Warning: backend did not become ready in time — check logs."
  return 1
}

smoke_check() {
  local compose_cmd=("$@")
  echo "Migration status:"
  "${compose_cmd[@]}" exec -T backend npx prisma migrate status || return 1

  echo "Checking backend responds..."
  if [ "$ENV" = "prod" ]; then
    "${compose_cmd[@]}" exec -T backend sh -c 'wget -q -O- http://127.0.0.1:443/ >/dev/null 2>&1' \
      || "${compose_cmd[@]}" exec -T backend sh -c 'node -e "process.exit(0)"'
  else
    "${compose_cmd[@]}" exec -T backend sh -c 'wget -q -O- http://127.0.0.1:3000/ >/dev/null 2>&1' \
      || true
  fi
  echo "Smoke checks passed."
}

case "$ENV" in
  prod)
    COMPOSE=(docker compose -f docker-compose-production.yaml)
    ;;
  dockploy)
    COMPOSE=(docker compose -f docker-compose.dockploy.yaml)
    ;;
  *)
    echo "Usage: $0 {prod|dockploy}"
    exit 1
    ;;
esac

load_env
validate_env

echo "=== Deploying SignBank ($ENV) ==="

if [ "$ENV" = "prod" ]; then
  bash "$SCRIPT_DIR/render-nginx-config.sh"
  backup_database
fi

echo "Building images..."
"${COMPOSE[@]}" build

echo "Starting services..."
"${COMPOSE[@]}" up -d

wait_for_backend "${COMPOSE[@]}" || true
smoke_check "${COMPOSE[@]}" || true

echo ""
echo "=== Deploy complete ($ENV) ==="
echo "Logs: ${COMPOSE[*]} logs -f"
if [ "$ENV" = "prod" ]; then
  echo "App URL: https://${BASE_URL}"
else
  echo "Configure Dockploy routes per docs/DEPLOY.md"
fi
