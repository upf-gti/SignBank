# SignBank Deployment Guide

See also: [OPERATIONS_PLAN.md](./OPERATIONS_PLAN.md) | [DATABASE.md](./DATABASE.md) | [OPERATIONS_PROGRESS.md](./OPERATIONS_PROGRESS.md)

---

## Environments

| Environment | Compose file | Entry |
|-------------|--------------|-------|
| Local dev | `docker-compose-local.yaml` | `make setup` |
| Test (Dockploy) | `docker-compose.dockploy.yaml` | Dockploy UI |
| Test (manual) | `docker-compose-test.yaml` | `make test-up` |
| Production | `docker-compose-production.yaml` | `make prod-up` |

---

## First-time deploy checklist

### 1. Prerequisites

- [ ] Server with Docker (or Dockploy installed)
- [ ] Domain pointed at server (for test/prod)
- [ ] Git repo connected (Dockploy) or cloned on server

### 2. Environment variables

Copy `.env.example` → `.env` and set:

| Variable | Required | Notes |
|----------|----------|-------|
| `BASE_URL` | Yes | Hostname only, e.g. `test.signbank.example.com` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Yes | Strong password in prod |
| `DATABASE_URL` / `DATABASE_URL_DOCKER` | Yes | Docker URL uses service name `postgres` |
| `JWT_SECRET` | Yes | Min 32 chars; **required in production** |
| `TYPESENSE_API_KEY` | Yes | Random string |
| `TYPESENSE_HOST` | Yes | `typesense` in Docker network |
| `TYPESENSE_PORT` | Yes | `8108` |
| `DUFS_URL` | Yes | `http://dufs:5000` in Docker |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First deploy | Creates admin if none exists |
| `SEED_DB` | Test only | Set `true` once for sample data, then remove |

### 3. File storage

Create video directories (not in git):

```bash
mkdir -p FileServer/gloss-videos FileServer/example-videos FileServer/definition-videos
```

### 4. SSL

- **Local:** `make setup` checks for `nginx/certs/server.crt` + `.key`
- **Dockploy:** Enable Let's Encrypt in Dockploy for your domain
- **Manual prod:** Place certs in `nginx/certs/` or configure Let's Encrypt

### 5. Deploy

**Local:**
```bash
make setup
make logs
```

**Production:**
```bash
make prod-up
make logs
```

**Dockploy:** See [Dockploy routing](#dockploy-routing) below.

### 6. Post-deploy smoke tests

- [ ] `https://<BASE_URL>/` loads frontend
- [ ] Login with admin credentials works
- [ ] Search returns results (after seed or accepted glosses)
- [ ] Video plays from `/lscassets/gloss-videos/...`
- [ ] Restart backend container → search still works

### 7. Migrations

Migrations run automatically via `backend/docker-entrypoint.sh` on container start.

Verify after deploy:
```bash
docker compose exec backend npx prisma migrate status
```

Expected: `Database schema is up to date`

---

## Update deploy (existing environment)

1. Pull latest code / trigger Dockploy rebuild
2. **Backup DB** (prod): see [DATABASE.md](./DATABASE.md)
3. Deploy new containers (`make prod-up` or Dockploy)
4. Check migration status
5. Run smoke tests

Do **not** set `SEED_DB=true` on updates — it re-runs seed data.

---

## Dockploy routing

When using `docker-compose.dockploy.yaml` (no nginx container):

| Public path | Target service | Port |
|-------------|----------------|------|
| `/` | frontend | 80 |
| `/api/*` | backend | 3000 (strip `/api` prefix) |
| `/lscassets/*` | dufs | 5000 |

Set all env vars in the Dockploy project settings (never commit secrets).

**First test deploy:** use an empty Postgres volume so migrations apply cleanly from scratch.

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Backend won't start in prod | Logs for missing `JWT_SECRET` or env validation errors |
| 502 on `/api` | Backend container running; `DATABASE_URL` correct |
| Search empty after restart | Typesense bootstrap logs; admin `POST /api/typesense/sync` |
| Videos 404 | `FileServer/` exists and dufs volume mounted |
| Migration failed | `prisma migrate status`; see DATABASE.md |

---

## Admin-only maintenance endpoints

**Note:** After deploying Phase 2 search changes, run `POST /api/typesense/sync/recreate` once (admin) to apply the new schema fields (`lexicalCategory`, `senseTitle`, etc.).

- `GET /typesense/status` — index stats
- `POST /typesense/sync` — full re-index (non-destructive)
- `POST /typesense/sync/init` — ensure collection exists
- `POST /typesense/sync/recreate` — **destructive** drop + recreate + sync
