---
name: signbank-search-typesense
description: SignBank Typesense search indexing, phonology facets, sync events, and search API. Use when modifying search behavior, phonology filters, Typesense schema, re-indexing, or debugging missing/stale search results.
---

# SignBank Search (Typesense)

## Architecture

- **Collection**: `videos` (one document per `Video` row, not per gloss)
- **Schema**: `backend/src/typesense/typesense.config.ts`
- **Service**: `backend/src/typesense/typesense.service.ts`
- **Sync subscriber**: `backend/src/typesense/typesense.subscriber.ts`
- **Search API**: `GET /search` → `SearchService` → Typesense

Backend initializes collection and full sync on module init (`onModuleInit`).

## Indexed fields

Faceted phonology fields (string enum values from Prisma):

`hands`, `configuration`, `configurationChanges`, `relationBetweenArticulators`, `location`, `movementRelatedOrientation`, `orientationRelatedToLocation`, `orientationChange`, `contactType`, `movementType`, `movementDirection`

Also: `gloss`, `signVideoTitle`, `description` (first definition of highest-priority sense), `vocalization`, `nonManualComponent`, `inicialization`, `repeatedMovement`, `url`, `glossId`.

## Search query

`SearchService` defaults:

```typescript
query_by: 'gloss,signVideoTitle,configuration,configurationChanges,description,...'
```

Frontend passes `filter_by` for phonology facets (Typesense filter syntax, e.g. `location:=MOUTH`).

DTO: `backend/src/search/dto/search.dto.ts`.

## Incremental sync (events)

Emit after video/sign-video mutations:

| Event | Action |
|-------|--------|
| `video.created` | Upsert documents for all videos in sign video |
| `video.updated` | Same |
| `video.deleted` | Delete document by `video.id` |

Subscriber rebuilds `VideoIndex` from Prisma include chain (signVideo → glossData → senses → definitions).

## Manual sync endpoints

| Route | Purpose |
|-------|---------|
| POST `/typesense/sync/init` | Create/recreate collection |
| POST `/typesense/sync` | Full re-index all videos |
| GET `/typesense/status` | Collection stats |

Use after schema changes to `videosSchema` or bulk data imports.

## Changing the schema

1. Edit `videosSchema` in `typesense.config.ts`
2. Re-init collection (drops existing — plan for re-sync)
3. Run full sync
4. Update frontend facet/filter components if fields added

## Env vars

```
TYPESENSE_HOST=typesense   # docker service name
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=...        # never commit real key
```

## Debugging

| Issue | Fix |
|-------|-----|
| No results after new gloss | Check DictionaryEntry exists; videos indexed only for published gloss data with videos |
| Stale phonology filters | Trigger `video.updated` or full sync |
| Collection missing | Backend boot failed — check typesense container logs |
| CORS errors (direct) | Frontend should use `/api/search`, not Typesense directly |

## Frontend

Search page: `frontend/src/pages/SearchPage.vue`, components in `frontend/src/components/Search/`. Phonology filters in `SearchPhonologyFilters.vue` and shared `PhonologyFilters.vue` — values must match Prisma enum strings exactly.
