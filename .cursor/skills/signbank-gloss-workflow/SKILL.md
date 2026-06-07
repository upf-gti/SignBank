---
name: signbank-gloss-workflow
description: SignBank gloss request creation, validation, submission, and admin approval workflow. Use when implementing or debugging gloss requests, draft editing, submit/accept/decline flows, or DictionaryEntry publication.
---

# SignBank Gloss Request Workflow

## Status flow

```
NOT_COMPLETED  ──submit (validated)──►  WAITING_FOR_APPROVAL
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                    ACCEPTED              DENIED            (admin views)
                         │
                         ▼
              DictionaryEntry created
              (GlossStatus.PUBLISHED)
```

## Key files

| Area | Path |
|------|------|
| Service | `backend/src/gloss-requests/gloss-requests.service.ts` |
| Controller | `backend/src/gloss-requests/gloss-requests.controller.ts` |
| Validation | `backend/src/utils/gloss-validation.ts` |
| Frontend create/edit | `frontend/src/pages/CreateGlossRequest.vue`, `EditGlossRequest.vue` |
| Admin review | `ConfirmRequestsPage.vue`, `ReviewGlossRequest.vue` |

## API endpoints

| Method | Route | Who |
|--------|-------|-----|
| POST | `/gloss-requests` | Authenticated user — creates draft |
| GET | `/gloss-requests/my-requests` | Creator |
| GET | `/gloss-requests/pending` | Admin |
| GET | `/gloss-requests/:id` | Owner or admin |
| POST | `/gloss-requests/:id/submit` | Creator only, status must be `NOT_COMPLETED` |
| POST | `/gloss-requests/:id/accept` | Admin — creates `DictionaryEntry` |
| POST | `/gloss-requests/:id/decline` | Admin — requires `denyReason` |

## Submit validation rules

`validateGlossRequest()` enforces before submit:

1. **Gloss** string non-empty
2. **At least one sense**
3. Per sense:
   - At least one **definition** with non-empty text
   - At least one **sense translation**
4. **At least one SignVideo** with:
   - Title
   - Complete **VideoData** phonology (all enum fields set, not EMPTY where required)
   - At least one **Video** with URL and angle

Validation errors return `400` with `{ message, errors: string[] }`.

## Accept behavior

Transaction in `acceptGlossRequest`:

1. Set request `status = ACCEPTED`, `acceptedById = admin userId`
2. Create `DictionaryEntry` linking `glossDataId = requestedGlossDataId`, `isCreatedFromRequest = true`

Does **not** copy data — the existing `GlossData` from the request becomes the published entry.

## Decline behavior

Sets `DENIED`, `deniedById`, stores `denyReason`. GlossData remains but has no DictionaryEntry.

## Editing drafts

While `NOT_COMPLETED`, creator edits nested entities (senses, definitions, videos) via gloss-data-style endpoints scoped to the request's `requestedGlossDataId`. `lastEditedSection` tracks progress in UI.

## Direct admin edits (published glosses)

Published glosses use `GlossDataModule` (`/gloss-data/...`) with `@Roles(Role.ADMIN)`. Archive/unarchive via `PATCH .../archive` and `.../unarchive`.

## Implementation checklist

When changing workflow logic:

- [ ] Update `gloss-validation.ts` if required fields change
- [ ] Keep frontend form validation aligned with backend messages
- [ ] Ensure video upload completes before submit (relative URLs in DB)
- [ ] After accept, verify Typesense has indexed videos (sync on backend boot + events)
- [ ] Test creator cannot submit others' requests (`ForbiddenException`)
- [ ] Test double-submit blocked (`BadRequestException` if not `NOT_COMPLETED`)
