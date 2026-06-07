# SignBank Data Model Reference

## LexicalCategory values

NOUN, VERB, ADJECTIVE, ADVERB, PRONOUN, INTERJECTION, PARTICLE, and combined forms (e.g. NOUN_OR_VERB, VERB_OR_ADJECTIVE). Full list in `schema.prisma`.

## RelationType values

SYNONYM, REGIONAL_VARIANT, ASSOCIATED_CONCEPT, ANTONYM, HOMONYM, VARIANT, HYPERNYM, HYPONYM.

## Video URL storage

Videos are stored on Dufs, not in DB blobs. `Video.url` and example/definition video fields hold **relative paths** like:

- `gloss-videos/<filename>`
- `example-videos/<filename>`
- `definition-videos/<filename>`

Served publicly via nginx at `/lscassets/<path>`.

## Priority fields

`Sense`, `Definition`, `SignVideo`, and `Video` use `priority` (Int, default 0). Lower priority = shown first. Reorder endpoints exist for senses.

## Cascade deletes

`GlossData` deletion cascades to senses, videos, relations. `DictionaryEntry` references `GlossData` with cascade. Deleting a `GlossRequest` cascades its `requestedGlossData`.

## Typesense linkage

Search indexes individual `Video` rows (not SignVideo). Each document includes parent gloss string, phonology fields from `VideoData`, and first definition text as `description`. See `signbank-search-typesense` skill.

## Version fields

`DictionaryEntry` and `GlossData` track `currentVersion`, `editComment`, `isCreatedFromRequest`, `isCreatedFromEdit` for edit workflow (partially used).
