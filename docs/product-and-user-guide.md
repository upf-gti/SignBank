# SignBank — What it does and what users do

## What SignBank is

SignBank is a **web platform for sign-language glossary management**. It lets people **look up signs** (with text search and rich filters), **open detailed entries** (definitions, examples, translations, video, phonological metadata, related signs, minimal pairs), and **propose new or updated entries** through a **request and approval** workflow. Administrators **curate the live dictionary**: they review submissions, accept or decline them, and **edit published glosses** directly.

The stack is described in the root [README.md](../README.md); structure of the codebase is in [application-structure.md](./application-structure.md).

---

## Who uses it

The product assumes **three kinds of people** (enforced in the backend; reflected in the UI):

1. **Visitors (not logged in)**  
   Can use public-facing features that do not require an account.

2. **Signed-in users (`USER` role)**  
   Can create and manage **their own gloss requests** and submit them for review.

3. **Administrators (`ADMIN` role)**  
   Can do everything users can, plus **review pending requests**, **manage accounts**, and **edit or archive published gloss content** in the live lexicon.

---

## What each role is expected to do

### Visitors

- **Search** for glosses from the home/search page: text query plus category and phonology-style filters where available.
- **Open a gloss** from results to see full detail: senses, definitions, example sentences, translations, sign videos, related entries, minimal pairs, etc.
- **Optionally register and log in** if they want to contribute (registration/login is available from the header; exact policy may depend on how your deployment uses registration).

Visitors **do not** see menu entries for “create entry”, request confirmation, or user management.

### Signed-in users (contributors)

- **Create a gloss request** — Start a new proposed entry (gloss name and, in later steps, the same rich structure as a full entry where the UI allows).
- **Edit drafts** — Work on requests that are not yet submitted or are sent back as not completed.
- **Submit for review** — When the entry is ready, send it so an admin can approve or decline it.
- **Track requests** — Use “My requests” to see status (e.g. draft, waiting for approval, accepted, denied).

Contributors **cannot** change **published** dictionary content on the main gloss page; that is an **admin** capability. The API also restricts sensitive operations to the right role.

### Administrators

- **Review the queue** — Open “Confirm requests”, inspect each submission, and **accept** or **decline** (with validation enforced before accept).
- **Edit published glosses** — On a live gloss URL (`/gloss/...`), enter edit mode to maintain senses, definitions, examples, videos, relations, etc., and to **archive** or **unarchive** entries as needed.
- **User management** — List users, create accounts, change roles, reset passwords, delete users (see [backend/README.md](../backend/README.md) for `/users` capabilities).

---

## Typical workflows (plain language)

**Look up a sign**  
Search → pick a result → read definitions and watch videos → follow links to related or contrasting signs if present.

**Propose a new sign or sense**  
Log in → “Create entry” / My requests → create request → fill in structured fields → submit → wait for admin decision.

**Maintain the dictionary (admin)**  
Log in as admin → review pending requests → accept (publishes per your data model) or decline → for published entries, open the gloss and edit or archive as needed.

---

## What the system does behind the scenes (user-relevant)

- **Search** is powered by **Typesense** so queries stay fast and filterable; the backend keeps the index in sync (operators may run sync/init via documented endpoints — see backend README).
- **Media** (e.g. sign videos) is stored on the file server and referenced by URLs the app displays in players and cards.
- **Security** is JWT-based: most write operations require a valid token; admin-only screens and APIs require the admin role.

---

## Where to go next

- Operators and developers: root [README.md](../README.md) (Docker, env, deployment, backups).
- API reference: [backend/README.md](../backend/README.md).
- Code map: [application-structure.md](./application-structure.md).
