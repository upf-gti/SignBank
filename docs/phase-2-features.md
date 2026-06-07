# SignBank — Phase 2 feature ideas

---

## Lexicon & content management

| Idea | Why it matters |
|------|----------------|
| **Entry management screen** | Dedicated admin UI to browse *all* published glosses (and maybe archived) with filters, bulk actions, and quick jumps to edit—instead of relying only on search + deep links. |
| **Change history / audit log** | Who changed what on a gloss or request, and when; supports accountability and reverting mistakes. |
| **Draft vs published workflow for in-place edits** | Admins edit in a staging state; changes go live only after review, mirroring the request flow for consistency. |
| **Import / export** | Bulk ingest from spreadsheets or LMF/JSON; export for backup, partners, or research. |

---

## Accounts, access, and onboarding

| Idea | Why it matters |
|------|----------------|
| **Improved user creation & password recovery** | Self-service reset (email tokens), invitation links, clearer admin flows, and stricter password policy if required by policy. |
| **Rate limits & abuse controls** | Protect registration, login, and upload endpoints. |

---

## Request & review workflow

| Idea | Why it matters |
|------|----------------|
| **Comments / threads on requests** | Reviewers ask contributors for fixes without declining outright. |
| **Assignment** | Route requests to a specific reviewer or queue. |
| **SLA or reminders** | Optional notifications for stale pending requests. |
| **Public “suggested correction”** | Logged-in users flag issues on a published gloss without full edit rights. |

---

## Search & discovery

| Idea | Why it matters |
|------|----------------|
| **Search analytics** | Popular queries, zero-result queries—guides content priorities. |
| **Saved searches / alerts** | Power users notified when new glosses match criteria. |
| **Keyboard-first navigation** | Faster access for heavy dictionary users. |
| **Embeddable widgets** | Let partner sites embed search or a single gloss card (with CORS/API keys). |

---

## Media & accessibility

| Idea | Why it matters |
|------|----------------|
| **Transcripts / captions** | Text alongside video for accessibility and indexing. |
| **Image fallback** | Key frames where video is missing or blocked. |

---

## Platform & operations

| Idea | Why it matters |
|------|----------------|
| **Automated Typesense sync** | Triggers on data changes instead of manual or ad hoc sync (if not already fully automated end-to-end). |
| **Health dashboards** | DB, Typesense, disk space, backup freshness. |
| **Structured logging & tracing** | Easier incident response in production. |
| **E2E test suite** | Critical paths: login, search, open gloss, submit request, admin accept. |

---

## Client experience

| Idea | Why it matters |
|------|----------------|
| **PWA / offline cache** | Last-viewed glosses available with poor connectivity. |
| **Deep i18n** | Ensure every string and date/number format is localized consistently beyond current locales. |
| **Print / PDF glossary views** | For handouts or linguistic documentation. |

---

## How to use this list

1. **Prioritize** with users (lexicographers, admins, public) and technical constraints.  
2. **Split** large items (e.g. “entry management”) into vertical slices: list view → filters → bulk archive → export.  
3. **Link** implemented work back here or archive bullets so the doc stays honest.

---

## Related docs

- [Product & user guide](./product-and-user-guide.md) — current behavior and roles  
- [Application structure](./application-structure.md) — where new features would plug in  
