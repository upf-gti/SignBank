# SignBank

A sign language dictionary platform with video-based entries, multilingual translations (Catalan, Spanish, English), phonological data, and a gloss request/approval workflow.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Quasar 2, Pinia, Vue Router, Axios |
| Backend | NestJS, TypeScript, Prisma |
| Database | PostgreSQL 16 |
| Search | Typesense 27.1 |
| File storage | Dufs |
| Reverse proxy | Nginx |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (v2+)
- `make` (available by default on macOS/Linux; on Windows install via [Chocolatey](https://community.chocolatey.org/packages/make) with `choco install make`, [Scoop](https://scoop.sh/) with `scoop install make`, or use [WSL](https://learn.microsoft.com/windows/wsl/))

## Quick Start

```bash
git clone <repo-url> && cd SignBank
cp .env.example .env   # edit .env with your values
make setup              # builds and starts all containers
```

The backend will automatically run database migrations and seed dev data on first boot. Follow progress with `make logs`.

The app will be available at `https://localhost` (you may need to accept the self-signed certificate).

Default dev credentials (10 admin accounts are created):
- **Admin 1**: `admin1@signbank.com` / `admin1123`
- **Admin 2-10**: same pattern (`admin{N}@signbank.com` / `admin{N}123`)

## Common Commands

Run `make help` to see all available targets.

| Command | Description |
|---|---|
| `make up` | Start the local environment |
| `make down` | Stop the local environment |
| `make logs` | Tail logs for all services |
| `make seed` | Run the database seed script |
| `make migrate` | Run pending database migrations |
| `make rebuild s=backend` | Rebuild and restart a specific service |
| `make shell s=backend` | Open a shell inside a running service |
| `make clean` | Stop everything and delete all volumes (full reset) |
| `make test-up` | Start the test environment |
| `make prod-up` | Start the production environment |

## Project Structure

```
SignBank/
├── backend/                    # NestJS API server
│   ├── prisma/                 # Schema, migrations, and seed script
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/                    # Application source code
│   ├── docker-entrypoint.sh    # Runs migrations (and optionally seed) on startup
│   ├── Dockerfile.local
│   ├── Dockerfile.prod
│   └── Dockerfile.test
├── frontend/                   # Vue 3 + Quasar SPA
│   ├── src/
│   ├── Dockerfile.local
│   ├── Dockerfile.prod
│   └── Dockerfile.test
├── nginx/                      # Nginx reverse proxy configs
│   ├── default.conf            # Local dev
│   ├── nginx.prod.conf/
│   ├── nginx.test.conf/
│   └── certs/                  # SSL certificates (gitignored)
├── typesense/                  # Typesense data directory
├── docker-compose-local.yaml
├── docker-compose-test.yaml
├── docker-compose-production.yaml
├── Makefile                    # Developer workflow commands
├── .env.example                # Environment variable template
└── README.md
```

## Architecture

```
                  ┌─────────┐
                  │  Nginx   │ :80 / :443
                  └────┬─────┘
           ┌───────────┼───────────┐
           │           │           │
      ┌────▼───┐  ┌────▼────┐  ┌──▼──┐
      │Frontend│  │ Backend │  │Dufs │
      │ (Vue)  │  │(NestJS) │  │files│
      └────────┘  └────┬────┘  └─────┘
                       │
              ┌────────┼────────┐
              │                 │
        ┌─────▼──────┐   ┌─────▼─────┐
        │ PostgreSQL  │   │ Typesense │
        │   (data)    │   │  (search) │
        └─────────────┘   └───────────┘
```

## Database

The database is managed with **Prisma**:

- **Schema**: `backend/prisma/schema.prisma`
- **Migrations**: `backend/prisma/migrations/` -- created with `npx prisma migrate dev` during development, applied with `npx prisma migrate deploy` in containers
- **Seed**: `backend/prisma/seed.ts` -- for dev/test only; creates sample glosses and users. Never runs in production.
- **Admin bootstrap**: handled by the application itself on startup (`AppService.onApplicationBootstrap`). If no admin exists, one is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars.

On container startup, `docker-entrypoint.sh` automatically runs `prisma migrate deploy`. If `SEED_DB=true` is set (default in local and test environments), it also runs the seed script.

## Database Backups

All environments include an automatic PostgreSQL backup service using [`kartoza/pg-backup`](https://github.com/kartoza/docker-pg-backup).

- **Production schedule**: Daily at 04:00 (configurable via `CRON_SCHEDULE`)
- **Retention**: Backups older than 30 days are automatically removed
- **Storage**: `./backend/backups/` on the host

## Changing the App Host/Domain

1. Edit `BASE_URL` in your `.env` file
2. Update the `server_name` directive in the relevant nginx config under `nginx/`
3. Restart: `make down && make up`

## Security

- Never hardcode the Typesense API key or JWT secret -- use `.env`
- Use HTTPS in production (configure Nginx and SSL certificates)
- Change the default database credentials for production
- Control access via backend authentication (JWT)

## Environments

| Environment | Compose file | Notes |
|---|---|---|
| Local dev | `docker-compose-local.yaml` | Hot reload, debug port 9229, `SEED_DB=true` |
| Test | `docker-compose-test.yaml` | Built images, `SEED_DB=true` |
| Production | `docker-compose-production.yaml` | Built images, no auto-seed, set `SEED_DB=true` only on initial deploy |

## Production Deployment

```bash
cp .env.example .env
# Edit .env with production values (strong passwords, real domain, etc.)
make prod-up
```

On every startup the backend automatically runs migrations, then checks if any admin account exists. If none is found (fresh deployment), it creates one from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. Nothing else is needed.
