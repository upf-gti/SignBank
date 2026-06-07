---
name: signbank-frontend
description: Vue 3 + Quasar frontend patterns for SignBank — routes, API client, Pinia auth, component layout, and video handling. Use when building or modifying UI pages, gloss detail views, search, user management, or gloss request forms.
---

# SignBank Frontend

Quasar + Vue 3 + Pinia + Vue Router in `frontend/src/`.

## API client

Boot file: `src/boot/axios.ts`. Exported as `apiClient`.

- Base URL: `{protocol}//{BASE_URL}/api` (from `VITE_BASE_URL` or `window.location.hostname`)
- Sends `Authorization: Bearer <token>` from Pinia `user.store`
- Auto-refreshes JWT on 401 via `useAuthentication().refreshToken()`
- `withCredentials: true`

```typescript
import { apiClient } from 'src/boot/axios';
const { data } = await apiClient.get('/glosses/123');
```

## Auth

- Store: `src/stores/user.store`
- Hook: `src/hooks/useAuthentication.ts` — login, logout, refresh
- Boot: `src/boot/auth.ts`

Admin-only UI: check user role from store before showing management routes.

## Routes (`src/router/routes.ts`)

| Path | Page |
|------|------|
| `/`, `/search` | SearchPage |
| `/gloss/:gloss` | GlossPage (detail) |
| `/my-requests/*` | Create/edit/view user's gloss requests |
| `/confirm-requests/*` | Admin review queue |
| `/user-management` | Admin user CRUD |

All use `layouts/MainLayout.vue` except 404.

## Component organization

Feature folders under `src/components/`:

- **GlossDetail/** — sense selector, definitions, examples, phonology (`SignFonologyComponent`), videos, relations, minimal pairs
- **Search/** — input, filters, phonology facets, result cards
- **UserManagement/** — table + dialogs; composable `src/composables/UserManagement/useUserManagement.ts`
- Shared: `VideoPlayer.vue`, `UploadVideoPopup.vue`, `PhonologyFilters.vue`

Pages are thin wrappers; heavy logic lives in components/composables.

## Video URLs

Uploaded videos return relative paths from API. Display via nginx:

```
/lscassets/{relativePath}
```

Example: API returns `gloss-videos/abc.mp4` → src `/lscassets/gloss-videos/abc.mp4`.

Validation helper: `src/utils/videoValidation.ts`.

## Search UI

Search hits Typesense through backend `GET /search` with query params (`query`, `filter_by`, `facet_by`, `page`, `limit`). Phonology filter components map to Typesense facet fields (enum string values from Prisma).

## Adding a page

1. Create `src/pages/MyPage.vue`.
2. Register route in `src/router/routes.ts` under `MainLayout`.
3. Use `apiClient` for data; Quasar components (`q-page`, `q-btn`, `q-dialog`, etc.).
4. Match existing patterns: loading states, mobile/desktop card variants where gloss detail does.

## Build & lint

```bash
# Inside frontend container or locally
npm run dev      # quasar dev
npm run build    # production build
npm run lint     # eslint
```

Docker dev server proxied through nginx at `https://localhost`; HMR via `/ws` WebSocket in nginx config.

## i18n

`vue-i18n` configured; check existing translation keys before hardcoding user-visible strings in new components.
