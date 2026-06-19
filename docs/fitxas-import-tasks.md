# SignBank — Fitxas import task list

Short checklist of work items from planning sessions (June 2026). Full detail in [`fitxas-import-requirements.md`](fitxas-import-requirements.md).

---

## Documentation

| Task | Description |
|------|-------------|
| Requirements doc | Consolidate schema v2 JSON, meeting decisions, and SignBank changes in one reference doc. |
| Import plan sync | Slim `fitxas-import-plan.md` to point at requirements; remove outdated v1 field tables. |
| Meeting agenda link | Point `fitxas-import-meeting-agenda.md` to the consolidated requirements outcome. |

---

## Database & schema

| Task | Status | Description |
|------|--------|-------------|
| Compound signs (schema) | **Done** | `isCompound`, `CompoundPart[]`, `externalId`, `iconicity` on `GlossData`; dev seed in `backend/prisma/seed/compound-bessons-1d.ts` (`BESSONS-1d` = GERMÀ + SEGON). |
| No compound phonology | **Done** (schema) | Compound glosses have no top-level `SignVideo`/`VideoData`; phonology on linked gloss or `CompoundPart.inlinePhonology`. |
| Compound import resolver | Open | Map fitxa `compound.*` in `import-fitxas`; resolve `comp_id` → `linkedGlossId`; nested compound warning. |
| Optional lexical category | Open | Make `Definition.lexicalCategory` optional; parse `Verb-` / `Nom-` prefix from each definition string. |
| Skip top-level `lexical_category` | Open | Do not import or show fitxa root `lexical_category` (e.g. `"Nom o verb"` on MENJAR). |
| Semantic categories | Open | `Category` model + many-to-many with `GlossData`; unique name, find-or-create on import. |
| Iconicity (full metadata) | Partial | Column on `GlossData` exists; import + gloss detail display still open. |
| Valency | Open | Store on `GlossData` as `valency` (fitxa `valencia` — verb transitivity, e.g. "Verb transitiu"). |
| Key signs | `KeySignGroup[]` from `signes_claus` — ordered gloss lists + optional comment. |
| Simultaneous morphology | `SimultaneousMorphology[]` from `morfologia_simultania`. |
| Abbreviated morphology | `AbbreviatedMorphology[]` from `morfologia_abreujada` (meaning still to confirm with Lali). |
| Named entity | `namedEntity` on `GlossData` from `entitat_amb_nom`. |
| Per-hand phonology | Dominant and non-dominant configuration + articulator relations on `VideoData`. |
| Handedness | New `Handedness` field from `nombre_mans` (`1`, `2a`, `2n`, `2s`, `x`) — distinct from `Hand` enum. |
| Hand configuration catalog | Replace closed `HandConfiguration` enum with extensible DB catalog + aliases for fitxa labels. |
| Traceability | Partial | `externalId` on `GlossData` exists; `sourceDocPath` and import wiring still open. |

---

## Import pipeline

| Task | Status | Description |
|------|--------|-------------|
| Schema v2 support | Open | Accept single-entry JSON files and multi-entry bundles (`bessons.json`). |
| Skip `synonyms[]` | Open | Do not import fitxa `synonyms`; relations only from `related_signs.*` → `RelatedGloss`. |
| Skip top-level fields | Open | Ignore `synonyms`, top-level `lexical_category`, `occurrences`, `relacio_signes_forasters`. |
| Two-pass import | Open | Pass 1: glosses + metadata; pass 2: resolve `related_signs` and `minimal_pairs` by gloss name. |
| Enum resolver v2 | Open | Map per-hand phonology fields; integrate configuration catalog when available. |
| Dry-run importer | Open | CLI/API report: stored vs skipped vs unmapped warnings before DB writes. |
| Compound import | Open | Map `compound.components[]`; inline phonology; no top-level `VideoData` when `isCompound`. |

---

## UI — gloss detail & editor

| Task | Status | Description |
|------|--------|-------------|
| Two-hand phonology table | Row labels on the left; **main hand** and **non-dominant hand** columns side by side; single-hand hides second column. |
| Compound & morphology table | Open | One section: sequential compound chain + columnar phonology, simultaneous morphology, abbreviated morphology, named entity. API read includes `compoundParts` on `GET /glosses/:id` only. |
| Key signs, iconicity, valency | Show beside definitions (not inside the compound table). |
| Semantic categories | Searchable multi-select in editor; pick existing or create new; chips on detail view. |
| Optional lexical category | Show category per definition when set; hide when null; no gloss-level lexical category field. |
| Related glosses only | Use existing `RelatedGlosses` UI for all relation types; no separate synonyms field. |
| Edit/create page rework | Extend `MoreContentComponent` stepper and related components for all new fields; compounds skip top-level phonology validation. |

---

## UI — admin (deferred, complex)

| Task | Description |
|------|-------------|
| Admin fitxa import page | ADMIN-only route: upload multiple JSON files, dry-run preview, commit import, per-file error report. Needs dedicated implementation session with step-by-step prompting. |

---

## Still to decide

| Task | Description |
|------|-------------|
| `morfologia_abreujada` meaning | Confirm with Lali; store and display regardless. |
| Publication workflow | Direct publish vs draft review vs hybrid on import. |
| Video pipeline | Google Drive download vs pre-exported local files. |
| Configuration catalog migration | Exact schema and admin UX for adding new hand configurations. |
| Search filter by category | Typesense facet for semantic categories (after import). |

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [`fitxas-import-requirements.md`](fitxas-import-requirements.md) | Full requirements |
| [`fitxas-import-plan.md`](fitxas-import-plan.md) | Implementation phases & architecture |
| [`fitxas-import-meeting-agenda.md`](fitxas-import-meeting-agenda.md) | Raw meeting notes |
