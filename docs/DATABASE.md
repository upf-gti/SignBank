# SignBank Database Guide

See also: [OPERATIONS_PLAN.md](./OPERATIONS_PLAN.md) | [DEPLOY.md](./DEPLOY.md)

---

## Migration policy (read this first)

1. **Never squash migrations** after test/prod has real data
2. **Never use `prisma db push`** on test or production
3. **Only create migrations locally** with `prisma migrate dev`
4. **Only apply on servers** with `prisma migrate deploy` (automatic in docker entrypoint)
5. **Always commit** migration SQL + application code in the same deploy

Current migration chain (fresh DB):

1. `20250101000000_sync_schema_changes` — no-op (history placeholder)
2. `20260321121000_init` — full schema

---

## Adding a column (safe workflow)

### Example: add optional `notes` to GlossData

**1. Local schema change** (`backend/prisma/schema.prisma`):

```prisma
model GlossData {
  ...
  notes String?   // nullable first
}
```

**2. Create migration locally:**

```bash
cd backend
npx prisma migrate dev --name add_gloss_data_notes
```

**3. Review generated SQL** in `prisma/migrations/<timestamp>_add_gloss_data_notes/migration.sql`

Reject if you see unexpected `DROP`, `RENAME`, or data loss.

**4. Test locally** with seed data:

```bash
make migrate   # or automatic on container start
```

**5. Commit** schema + migration folder + app code.

**6. Deploy to test** (Dockploy) → entrypoint runs `migrate deploy`.

**7. Verify:**

```bash
docker compose exec backend npx prisma migrate status
```

**8. Deploy to prod** after test passes (backup first).

---

## Required NOT NULL column (two-step)

```sql
-- Migration 1
ALTER TABLE "GlossData" ADD COLUMN "notes" TEXT;

-- Migration 2 (after backfill)
UPDATE "GlossData" SET "notes" = '' WHERE "notes" IS NULL;
ALTER TABLE "GlossData" ALTER COLUMN "notes" SET NOT NULL;
```

Or use `@default("")` in Prisma for migration 1.

---

## Risky changes

| Change | Safe approach |
|--------|---------------|
| Rename column | `@map("old_name")` or add new → copy data → drop old in separate release |
| Remove enum value | Deprecate in app; never remove from PG enum while data uses it |
| Unique constraint | Dedupe existing rows before migration |
| Drop column | Ensure app no longer reads/writes; backup first |

---

## Backup before migrate (production)

**Via kartoza container** (automatic daily to `./backend/backups/`):

Manual dump:
```bash
docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d).sql
```

---

## Rollback

Prisma has **no down migrations**. To rollback:

1. Restore PostgreSQL from backup dump
2. Deploy previous application image
3. Ensure `_prisma_migrations` table matches restored DB state

---

## Failed migration

1. Read error in backend logs
2. Check status: `npx prisma migrate status`
3. Fix forward — do not edit already-applied migration files
4. If migration failed mid-apply, may need manual SQL fix + `prisma migrate resolve`

```bash
# Mark a migration as applied (only when DB already matches)
npx prisma migrate resolve --applied "20260321121000_init"

# Mark as rolled back
npx prisma migrate resolve --rolled-back "migration_name"
```

---

## Fresh test baseline (Dockploy)

For a clean test environment:

1. Delete/recreate Postgres volume in Dockploy
2. Deploy with empty DB
3. Backend runs `migrate deploy` → both migrations apply
4. Set `SEED_DB=true` **once** if sample data needed
5. Confirm `migrate status` is up to date
6. From this point: **forward migrations only**

---

## Commands reference

| Task | Command |
|------|---------|
| Create migration (local) | `npx prisma migrate dev --name name` |
| Apply migrations (server) | `npx prisma migrate deploy` |
| Check status | `npx prisma migrate status` |
| Seed (dev/test) | `npx prisma db seed` |
| Open GUI | `npx prisma studio` |
