---
name: signbank-infrastructure
description: SignBank deployment infrastructure — nginx routing, Dufs file storage, Docker compose environments, SSL, and database backups. Use when configuring domains, proxy rules, video serving, production deploys, or backup/restore.
---

# SignBank Infrastructure

## Request routing (nginx)

Local config: `nginx/default.conf`. Production/test variants under `nginx/nginx.prod.conf/` and `nginx/nginx.test.conf/`.

```
https://host/           → frontend:443
https://host/ws         → frontend (WebSocket/HMR)
https://host/api/*      → backend:443  (strip /api prefix)
https://host/lscassets/* → dufs:5000   (video files)
```

- `client_max_body_size 20M` for uploads
- SSL certs: `nginx/certs/` (local self-signed) or Let's Encrypt paths in prod `.env`

## Changing domain

1. Set `BASE_URL` in `.env`
2. Update `server_name` in the relevant nginx config
3. Regenerate/obtain SSL certs for new domain
4. `make down && make up` (or prod equivalent)

## Dufs file server

- Compose service `dufs` mounts `./FileServer` → `/data`
- Backend uploads via `DUFS_URL` (default `http://dufs:5000`)
- Directory layout created by upload type:
  - `gloss-videos/`
  - `example-videos/`
  - `definition-videos/`

Videos stored as relative paths in PostgreSQL; nginx serves them publicly at `/lscassets/`.

## Docker images

| Component | Local | Prod |
|-----------|-------|------|
| Backend | `backend/Dockerfile.local` | `Dockerfile.prod` |
| Frontend | `frontend/Dockerfile.local` | `Dockerfile.prod` |
| Nginx | `nginx/Dockerfile.local` | prod nginx folder |

Backend entrypoint (`docker-entrypoint.sh`): `prisma migrate deploy`, optional seed if `SEED_DB=true`, then start app.

## Environments

| Env | Compose | Seed | Notes |
|-----|---------|------|-------|
| Local | `docker-compose-local.yaml` | yes | Volume mounts, debug 9229 |
| Test | `docker-compose-test.yaml` | yes | Built images |
| Production | `docker-compose-production.yaml` | no* | Admin from env vars on first boot |

*Set `SEED_DB=true` only on initial production deploy if needed.

## Database backups

Service: `kartoza/pg-backup` in all compose files.

- Dumps to `./backend/backups/` on host
- Retention: 30 days (`REMOVE_BEFORE=30`)
- Production schedule: daily 04:00 via `CRON_SCHEDULE`

Manual scripts in backend:

```bash
npm run backup:database
npm run restore:database
```

See `backend/src/backup/README.md` for backup module details.

## Production deploy

```bash
cp .env.example .env
# Set strong POSTGRES_PASSWORD, JWT_SECRET, TYPESENSE_API_KEY, BASE_URL, ADMIN_*
make prod-up
```

Migrations run automatically. First admin created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` if none exists.

## Security checklist

- Never commit `.env` or real API keys
- Use HTTPS in production
- Change default postgres credentials
- Restrict admin routes (JWT + Role.ADMIN)
- Typesense not exposed publicly — only via backend `/search`

## CI

GitHub Actions: `.github/workflows/releasePlease.yml` (release automation only — no deploy pipeline in repo).
