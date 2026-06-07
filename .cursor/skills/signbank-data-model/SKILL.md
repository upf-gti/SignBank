---
name: signbank-data-model
description: SignBank Prisma schema, gloss domain entities, phonology enums, and relationships. Use when adding migrations, querying gloss/sense/video data, understanding DictionaryEntry vs GlossData, or working with sign-language phonology fields.
---

# SignBank Data Model

Schema: `backend/prisma/schema.prisma`. Migrations: `backend/prisma/migrations/`.

## Core entity graph

```
User ──creates──► GlossRequest ──owns──► GlossData
                                              │
GlossRequest.accept ──creates──► DictionaryEntry ──points to──► GlossData
                                              │
GlossData ──┬── Sense[] ── Definition[], Example[], SenseTranslation[]
            ├── SignVideo[] ── VideoData (phonology) + Video[] (angles/urls)
            ├── RelatedGloss[] (source/target)
            └── MinimalPair[] (source/target)
```

## Published vs draft glosses

| Concept | Table | Meaning |
|---------|-------|---------|
| Draft / in-review | `GlossRequest` + linked `GlossData` | User workflow; not in public dictionary until accepted |
| Published entry | `DictionaryEntry` | Links to `GlossData`; has `GlossStatus` (`PUBLISHED` / `ARCHIVED`) |

A `GlossData` row can exist without a `DictionaryEntry` (pending request). Acceptance creates the `DictionaryEntry`.

## GlossRequest lifecycle

`RequestStatus`: `NOT_COMPLETED` → `WAITING_FOR_APPROVAL` → `ACCEPTED` | `DENIED`

Tracked fields: `creatorId`, `acceptedById`, `deniedById`, `denyReason`, `lastEditedSection`.

## Content hierarchy

```
GlossData.gloss (string identifier, e.g. "CASA")
└── Sense (senseTitle, lexicalCategory, priority)
    ├── Definition (definition, priority, optional videoDefinitionUrl)
    │   └── DefinitionTranslation (language: CATALAN|SPANISH|ENGLISH|OTHER)
    ├── Example (example, exampleVideoURL)
    │   └── ExampleTranslation
    └── SenseTranslation
└── SignVideo (title, priority)
    ├── VideoData — phonological description (enums + vocalization, nonManualComponent, inicialization, repeatedMovement)
    └── Video[] — url (relative path), angle, priority
```

## Phonology (VideoData)

Large Prisma enums on `VideoData` — do not invent values; use existing enum members:

| Field | Enum |
|-------|------|
| `hands` | `Hand` (RIGHT, LEFT, BOTH) |
| `configuration` | `HandConfiguration` (CONF_1 … CONF_40, Unicode variants) |
| `configurationChanges` | `ConfigurationChange` |
| `relationBetweenArticulators` | `RelationBetweenArticulators` |
| `location` | `Location` (body + compound locations) |
| `movementRelatedOrientation` | `MovementRelatedOrientation` |
| `orientationRelatedToLocation` | `OrientationRelatedToLocation` |
| `orientationChange` | `OrientationChange` |
| `contactType` | `ContactType` |
| `movementType` | `MovementType` |
| `movementDirection` | `MovementDirection` |

Frontend phonology filters and Typesense facets mirror these enum string values.

## Relations & minimal pairs

- `RelatedGloss`: directed edge with `RelationType` (SYNONYM, ANTONYM, HYPERNYM, …). Unique on `(sourceGlossId, targetGlossId)`.
- `MinimalPair`: `distinction` text between two glosses. Unique on `(sourceGlossId, targetGlossId)`.

## Users & auth

`User`: `Role` = `ADMIN` | `USER`. JWT tokens stored in `accessToken` / `refreshToken` columns.

## Migration rules

1. Edit `schema.prisma`, then `npx prisma migrate dev --name <name>` (development).
2. Containers apply with `prisma migrate deploy` on startup — never edit applied migration SQL retroactively.
3. Seed (`backend/prisma/seed.ts`) is dev/test only; production bootstraps admin via `AppService.onApplicationBootstrap`.

## Prisma includes pattern

Gloss detail queries typically deep-include:

```typescript
{
  glossVideos: { include: { videos: true, videoData: true } },
  senses: {
    include: {
      definitions: { include: { definitionTranslations: true } },
      examples: { include: { exampleTranslations: true } },
      senseTranslations: true,
    },
  },
  relationsAsSource: { include: { targetGloss: true } },
  relationsAsTarget: { include: { sourceGloss: true } },
  minimalPairsAsSource: { include: { targetGloss: true } },
  minimalPairsAsTarget: { include: { sourceGloss: true } },
}
```

See [reference.md](reference.md) for enum groupings and indexing notes.
