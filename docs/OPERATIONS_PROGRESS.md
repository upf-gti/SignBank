# SignBank Operations — Progress Tracker

Master plan: [OPERATIONS_PLAN.md](./OPERATIONS_PLAN.md)

Update this file after each completed task.

---

## Sprint 1 — Unblock test on Dockploy

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 1.1 | Typesense create-if-missing, no delete on boot | done | ensureCollectionExists, background bootstrap |
| 1.2 | JWT_SECRET in all compose files | done | local, test, prod + .env.example |
| 1.3 | Env validation + CORS fix on startup | done | config/env.validation.ts |
| 1.4 | Backup cron fix + path unify | done | daily default; disabled unless BACKUP_ENABLED=true |
| 1.5 | Protect /typesense/* with admin auth | done | JwtGuard + RolesGuard |
| 1.6 | docs/DEPLOY.md checklist | done | |
| 2A.1 | Audit migration status | pending | run on test when Dockploy ready |
| 2A.2 | Fresh baseline docs for test DB | done | docs/DATABASE.md |
| 2A.3 | Migration squash policy | done | in DATABASE.md |
| 3A.1 | docker-compose.dockploy.yaml | done | no nginx; backend :3000 |
| 3A.2 | Backend entrypoint for Dockploy | done | existing docker-entrypoint.sh |
| 3A.3 | Frontend Dockerfile entrypoint fix | done | docker-entrypoint.sh |
| 3A.4 | Dockploy routing notes in DEPLOY.md | done | in DEPLOY.md |

## Sprint 2 — Search + deploy scripts

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 2.1 | Unify index model (one doc per gloss) | done | id = glossData.id |
| 2.2 | Add lexicalCategory etc. to Typesense schema | done | run sync/recreate once on existing envs |
| 2.3 | Wire event emits on gloss/video mutations | done | gloss.search.sync event |
| 2.4 | Remove Typesense periodic crons | done | done in Phase 1 |
| 3B.2 | scripts/deploy.sh + prod-bootstrap.sh | pending | |
| 3B.3 | Harden docker-compose-production.yaml | partial | removed 5432/9229 ports, JWT, backup path |
| 3B.4 | Frontend prod Dockerfile entrypoint | pending | |
| 4.1 | Full docs/DATABASE.md | done | |
| 4.2 | migrate status in deploy script | pending | |

---

## Session log

| Date | Done |
|------|------|
| 2026-06-07 | Created OPERATIONS_PLAN.md, OPERATIONS_PROGRESS.md |
| 2026-06-07 | **Phase 1 complete** — Typesense stability, JWT/env, backup, auth, DEPLOY.md, DATABASE.md |
| 2026-06-07 | **Phase 3A complete** — docker-compose.dockploy.yaml, frontend entrypoint fix |
| 2026-06-07 | **Phase 2 complete** — unified gloss index, schema fields, event-driven sync |

---

## Current focus

**Next:** Phase 3B — deploy scripts + prod compose hardening

**After deploy:** Admin `POST /typesense/sync/recreate` once for new search schema fields
