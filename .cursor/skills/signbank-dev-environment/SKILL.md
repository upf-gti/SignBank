---
name: signbank-dev-environment
description: Run, debug, and reset the SignBank local/test/prod Docker stack. Use when starting the app, running migrations or seeds, tailing logs, rebuilding services, fixing SSL cert issues, or working with Makefile/docker-compose commands.
---

# SignBank Dev Environment

## Quick start

```bash
cp .env.example .env   # first time only
make setup             # check-certs → build → up -d
make logs              # follow all service logs
```

App URL: `https://localhost` (self-signed cert — accept in browser).

Default dev admins (from seed): `admin1@signbank.com` / `admin1123` (pattern `admin{N}@signbank.com` / `admin{N}123` for N=1–10).

## Makefile targets

| Command | Purpose |
|---------|---------|
| `make up` / `make down` | Start/stop local stack |
| `make migrate` | `prisma migrate deploy` in backend container |
| `make seed` | `prisma db seed` in backend container |
| `make rebuild s=backend` | Rebuild + recreate one service |
| `make shell s=backend` | Shell inside a container |
| `make clean` | `down -v` — **destroys all volumes** |
| `make test-up` / `make prod-up` | Other compose files |

Run `make help` for the full list.

## Compose files

| File | Use |
|------|-----|
| `docker-compose-local.yaml` | Hot reload, debug port 9229, `SEED_DB=true` |
| `docker-compose-test.yaml` | Built images, seeded |
| `docker-compose-production.yaml` | Production; no auto-seed unless `SEED_DB=true` on first deploy |

## Services (local)

| Service | Role |
|---------|------|
| `nginx` | HTTPS reverse proxy :80/:443 |
| `frontend` | Vue/Quasar dev server |
| `backend` | NestJS API (runs migrations on start) |
| `postgres` | PostgreSQL 16, port 5432 |
| `typesense` | Search index |
| `dufs` | Static file server for videos |
| `db-backup` | Scheduled pg dumps → `backend/backups/` |

## Environment variables

Source of truth: `.env.example`. Key vars:

- `DATABASE_URL` — host access; `DATABASE_URL_DOCKER` — inside compose network
- `BASE_URL` — hostname (also update nginx `server_name`)
- `TYPESENSE_*`, `JWT_SECRET`, `DUFS_URL`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — bootstrap admin when no admin exists (prod)

## Common workflows

**Schema change:**
```bash
# Dev: create migration inside backend container or locally with DATABASE_URL set
npx prisma migrate dev --name describe_change
make migrate   # deploy in running stack
```

**Backend debug:** Node inspector on `9229` when using local compose.

**Full reset:**
```bash
make clean && make setup
```

**SSL certs missing:** `make setup` fails at `check-certs`. Generate:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/server.key -out nginx/certs/server.crt -subj '/CN=localhost'
```

## Troubleshooting

| Symptom | Check |
|---------|-------|
| 502 from nginx | `make logs`, ensure backend/frontend are healthy |
| DB connection errors | `DATABASE_URL_DOCKER` in backend env, postgres healthcheck |
| Search empty/stale | Typesense init runs on backend boot; see `signbank-search-typesense` skill |
| Videos 404 | Dufs volume `./FileServer`; nginx path `/lscassets` → dufs |
| Migrations fail | `make shell s=backend` then `npx prisma migrate status` |

## Windows notes

`make` required (Chocolatey, Scoop, or WSL). For openssl path conversion issues in Git Bash, prefix with `MSYS_NO_PATHCONV=1`.
