---
name: signbank-backend-api
description: NestJS backend patterns for SignBank — modules, auth guards, DTOs, Prisma usage, and API endpoints. Use when adding or modifying backend routes, services, guards, or integrating with Prisma/Typesense/events.
---

# SignBank Backend API

NestJS app in `backend/src/`. Entry: `main.ts`. Root module: `app.module.ts`.

## Module map

| Module | Path prefix | Notes |
|--------|-------------|-------|
| AuthModule | `/auth` | Login, register, refresh, JWT |
| UsersModule | `/users` | Admin only |
| GlossRequestsModule | `/gloss-requests` | Draft workflow |
| GlossDataModule | `/gloss-data` | CRUD on published/archived glosses |
| GlossesModule | `/glosses` | Public gloss read |
| SignVideosModule | `/sign-videos` | Sign video + phonology |
| DefinitionsModule | `/definitions` | Definition CRUD |
| ExamplesModule | `/examples` | Example CRUD |
| TranslationsModule | `/translations` | Sense translations |
| ExampleTranslationsModule | `/example-translations` | |
| VideosModule | `/videos` | Upload/delete via Dufs |
| SearchModule | `/search` | Typesense proxy |
| TypesenseModule | `/typesense` | Sync/admin |
| BackupModule | — | Scheduled DB backups |

Nginx strips `/api` prefix — backend routes have **no** `/api` prefix.

## Auth pattern

```typescript
@Controller('resource')
@UseGuards(JwtGuard, RolesGuard)
export class ResourceController {
  @Get()
  @Roles(Role.ADMIN)  // omit for any authenticated user
  handler(@Request() req) { /* req.user.id, req.user.role */ }
}
```

Public routes: `@Public()` decorator on handler or controller (see `auth/decorator/public.decorator.ts`).

JWT config: `JWT_SECRET`, `JWT_EXPIRATION` in `.env`.

## Conventions

- **Services** hold business logic; inject `PrismaService`.
- **DTOs** in `dto/` with `class-validator` decorators.
- **Transactions** for multi-step writes: `this.prisma.$transaction(async (prisma) => { ... })`.
- **Validation** for gloss requests: `backend/src/utils/gloss-validation.ts`.
- **File uploads**: `VideosService` → Multer temp file → PUT to Dufs → return relative URL.

## Adding a new endpoint

1. Add method to `*.service.ts` (Prisma query/mutation).
2. Add DTO if body params needed.
3. Add controller route with appropriate guards.
4. If it affects search index, emit event or call TypesenseService (see below).
5. Update `backend/README.md` API section if user-facing.

## Event-driven Typesense sync

`TypesenseSubscriber` listens for:

- `video.created` / `video.updated` → re-index sign video
- `video.deleted` → delete document by video id

Emit from services after DB writes when video phonology or gloss association changes.

## Prisma in containers

```bash
make shell s=backend
npx prisma studio          # optional GUI
npx prisma migrate dev
npx prisma generate        # after schema changes
```

## Testing

Jest config in `backend/package.json`. Spec files: `*.spec.ts` alongside source. Run inside backend container or locally with `DATABASE_URL` set.

## API documentation

Full endpoint list: `backend/README.md`. Prefer matching existing URL patterns:

- Nested resources under `gloss-data/:id/senses/...`
- Admin mutations guarded with `@Roles(Role.ADMIN)`
- Gloss request mutations scoped to creator unless admin review
