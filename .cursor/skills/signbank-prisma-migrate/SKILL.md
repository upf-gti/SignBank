---
name: signbank-prisma-migrate
description: SignBank database schema changes via Prisma migrate dev (generated SQL, never hand-written). Use when editing backend/prisma/schema.prisma, adding tables/columns/enums, creating migrations, or when the user asks to update the database structure.
---

# SignBank Prisma Migrations

Schema: `backend/prisma/schema.prisma`. Migrations: `backend/prisma/migrations/`.

## Golden rule

**Never hand-write migration SQL** when changing the database structure. Always let Prisma generate it from `schema.prisma`.

| Do | Don't |
|----|-------|
| Edit `schema.prisma`, then run `prisma migrate dev` | Create or edit `migrations/*/migration.sql` by hand |
| Commit the generated migration folder + updated schema | Patch applied migrations retroactively |
| Run `prisma generate` after schema changes | Skip client regeneration |

## Workflow

### 1. Edit the schema

Change `backend/prisma/schema.prisma` only. See `signbank-data-model` for entity conventions.

### 2. Generate and apply the migration (Docker)

Stack must be running (`docker compose -f docker-compose-local.yaml ps`).

```bash
docker compose -f docker-compose-local.yaml exec backend npx prisma migrate dev --name describe_change
```

Use a short **snake_case** name: `compound_signs`, `optional_lexical_category`, `add_category_model`.

Prisma will:
- Diff schema vs database
- Create `backend/prisma/migrations/<timestamp>_describe_change/migration.sql`
- Apply the migration to the dev database
- Run `prisma generate`

### 3. Verify

```bash
docker compose -f docker-compose-local.yaml exec backend npx prisma migrate status
```

Expect: `Database schema is up to date!`

If seed data depends on new models, update `backend/prisma/seed.ts` (or `backend/prisma/seed/`) and run:

```bash
docker compose -f docker-compose-local.yaml exec backend npx prisma db seed
```

### 4. Deploy-only (CI / already-generated migrations)

When migration files already exist and you only need to apply them:

```bash
docker compose -f docker-compose-local.yaml exec backend npx prisma migrate deploy
```

Backend containers also run `migrate deploy` on startup in deployed environments.

## Review SQL before applying (rare)

Only when you must inspect SQL without applying:

```bash
docker compose -f docker-compose-local.yaml exec backend npx prisma migrate dev --name describe_change --create-only
```

Review the generated file, then apply with `migrate dev` (no `--create-only`) or `migrate deploy`.

## Windows without `make`

Use `docker compose -f docker-compose-local.yaml exec backend …` instead of `make migrate` / `make seed`.

## Host-side alternative

If `DATABASE_URL` in `.env` points at `localhost:5432` (postgres exposed), you can run from `backend/`:

```bash
npx prisma migrate dev --name describe_change
```

Prefer the **Docker exec** path so `DATABASE_URL` matches the running stack.

## Checklist

```
- [ ] schema.prisma updated
- [ ] prisma migrate dev --name … (generated SQL, not hand-written)
- [ ] prisma migrate status shows up to date
- [ ] seed updated if needed and re-run
- [ ] backend code uses new Prisma types (generate ran)
```

## Related skills

- `signbank-data-model` — entities, enums, relationships
- `signbank-dev-environment` — Docker stack, compose files, troubleshooting
