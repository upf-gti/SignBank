# SignBank Operations — Progress Tracker

Master plan: [OPERATIONS_PLAN.md](./OPERATIONS_PLAN.md)

Update this file after each completed task.

---

## Sprint 1 — Unblock test on Dockploy

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 1.1 | Typesense create-if-missing, no delete on boot | done | |
| 1.2 | JWT_SECRET in all compose files | done | |
| 1.3 | Env validation + CORS fix on startup | done | |
| 1.4 | Backup cron fix + path unify | done | |
| 1.5 | Protect /typesense/* with admin auth | done | |
| 1.6 | docs/DEPLOY.md checklist | done | |
| 3A.1 | docker-compose.dockploy.yaml | done | |
| 3A.2 | Backend entrypoint for Dockploy | done | |
| 3A.3 | Frontend Dockerfile entrypoint fix | done | |
| 3A.4 | Dockploy routing notes in DEPLOY.md | done | |

## Sprint 2 — Search + deploy scripts

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 2.1 | Unify index model (one doc per gloss) | done | |
| 2.2 | Add lexicalCategory etc. to Typesense schema | done | |
| 2.3 | Wire event emits on gloss/video mutations | done | |
| 2.4 | Remove Typesense periodic crons | done | |
| 3B.1 | Parameterize nginx server_name | done | template + render-nginx-config.sh |
| 3B.2 | scripts/deploy.sh + prod-bootstrap.sh | done | |
| 3B.3 | Harden docker-compose-production.yaml | done | service DNS, depends_on, no public DB port |
| 3B.4 | Frontend prod Dockerfile entrypoint | done | Phase 3A |
| 4.1 | Full docs/DATABASE.md | done | |
| 4.2 | migrate status in deploy script | done | deploy.sh smoke_check |

## Optional / later

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 2A.1 | Audit migration status on test DB | pending | when Dockploy live |
| 3B.5 | GitHub Actions build + push | pending | optional |

---

## Session log

| Date | Done |
|------|------|
| 2026-06-07 | Phase 1, 2, 3A |
| 2026-06-07 | **Phase 3B complete** — deploy scripts, nginx template, prod compose fixes |

---

## Current focus

**Optional next:** GitHub Actions CI (3B.5) or Dockploy test deploy verification (2A.1)

**After any deploy with Phase 2 search:** Admin `POST /typesense/sync/recreate` once
