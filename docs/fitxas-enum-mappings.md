# Fitxa → SignBank enum mappings

How to use `Traducció etiquetes-Taules.xlsx` to parse scraped fitxa JSON into SignBank Prisma enums.

## Recommended approach

| Layer | Format | Role |
|-------|--------|------|
| **Source (editable)** | `Traducció etiquetes-Taules.xlsx` | What the dictionary team maintains |
| **Generated (committed)** | `backend/src/import/fitxa-enum-mappings.json` | Machine-readable lookup tables |
| **Runtime** | `backend/src/import/fitxa-enum-resolver.ts` | Import script calls `resolveFitxaEnum()` |

**Do not** read the `.xlsx` at import time. Regenerate JSON when the spreadsheet changes.

```bash
node backend/scripts/generate-fitxa-mappings.js "path/to/Traducció etiquetes-Taules.xlsx"
```

Optional analysis report (gaps vs Prisma):

```bash
node backend/scripts/analyze-fitxa-mappings.js "path/to/Traducció etiquetes-Taules.xlsx"
# → docs/fitxas-mapping-analysis.json
```

## JSON structure

```json
{
  "fields": {
    "configuration": {
      "enum": "HandConfiguration",
      "jsonField": "phonology.configuracio",
      "entries": [
        {
          "signbankId": "CONF_33",
          "aliases": ["q", "beak", "q (beak)", "beak (q)"]
        }
      ],
      "unmapped": []
    }
  }
}
```

**Lookup rule:** normalize input (lowercase, strip accents, collapse spaces) → match against `aliases[]` → return `signbankId`.

For compound phonology values like `"2n COMP: Espai neutre"`, the resolver strips the `2n COMP:` prefix before lookup.

## XLSX sheet → SignBank enum

| XLSX sheet | JSON field | SignBank enum | Match quality |
|------------|------------|---------------|---------------|
| `Handedness-mans` | `phonology.nombre_mans` | *(not `Hand`)* | 5 codes: `1`, `2a`, `2n`, `2s`, `x` |
| `Configuracions` | `configuracio`, `configuracio_ma_*` | `HandConfiguration` | 51/57 via `ID_CONFIGURACIO` → `CONF_*` |
| `Canvi de configuració` | `canvi_configuracio` | `ConfigurationChange` | 19/22 |
| `Relació entre articuladors` | `relacio_articuladors` | `RelationBetweenArticulators` | 9/14 |
| `Localitzacions` | `localitzacio` | `Location` | 136/148 |
| `Oirentació relativa_moviment` | `orientacio_moviment` | `MovementRelatedOrientation` | 48/48 |
| `Orientació relativa_localitzaci` | `orientacio_localitzacio` | `OrientationRelatedToLocation` | 26/27 |
| `Canvi_orientació` | `canvi_orientacio` | `OrientationChange` | 16/19 |
| `Tipus_contacte` | `tipus_contacte` | `ContactType` | 13/16 |
| `Forma_moviment` | `forma_moviment` | `MovementType` | 8/9 |
| `Direcció_moviment` | `direccio_moviment` | `MovementDirection` | 62/62 |
| `Categoria lèxica` | `lexical_category` | `LexicalCategory` | 25/27 |
| `Tipus_relació_altres_signes` | `related_signs.*` | `RelationType` | 7/7 |

Sheets not yet wired: `Camp_semàntic`, `Etiquetes-Tags`, `València`, `Morfologia seqüencial`, etc.

## Important gaps to fix manually

### 1. `Hand` enum ≠ handedness codes

SignBank `Hand` = `RIGHT` | `LEFT` | `BOTH`.

Fitxa `nombre_mans` = `1` | `2a` | `2n` | `2s` | `x` (different taxonomy).

**Recommendation:** Add a `handedness` string/code field on `VideoData` or `GlossData`, or a new enum matching the xlsx — do not force-map to `Hand`.

### 2. Label mismatches (add to `aliases` or fix xlsx)

| Fitxa value | SignBank enum | Issue |
|-------------|---------------|-------|
| `Damunt / Sota` | `ABOVE_BELOW` | Auto-guess was `ABOVE_OR_BELOW` |
| `AO: palm-down` | `AO_PALM_DOWN` | CA label uses `AO: Palmell-avall` — aliases cover this |
| `Pont del nas` | `BRIDGE_OF_NOSE` | English xlsx row differs from enum key |
| `Mà no-dominant` | `WEAK_HAND` | Catalan label in JSON, English xlsx has `Weak hand` |
| `O_SSI (O)` | `CONF_3`? | Verify alias for `0_SSI` / `O` |

### 3. Combined values (`B (B) / O_SSI (O)`)

JSON often combines dominant/non-dominant with `/`. Import should:

1. Split on `/`
2. Map each part separately (when per-hand fields exist)
3. Or map the combined string as an extra alias on the primary configuration

### 4. Rows skipped in xlsx

Some `Configuracions` rows have Google Drive URLs in `ID_CONFIGURACIO` instead of numeric IDs — fix in spreadsheet or add manual aliases.

## Usage in import script

```typescript
import { resolveFitxaEnum, mapPhonologyFromFitxa } from '../import/fitxa-enum-resolver';

const config = resolveFitxaEnum('configuration', 'Q (Beak)');
// → { value: 'CONF_33', field: 'configuration', input: 'Q (Beak)' }

const phonology = mapPhonologyFromFitxa(fitxa.phonology);
// → per-field results; null value = log warning, store EMPTY
```

## Related files

| File | Purpose |
|------|---------|
| `backend/src/import/fitxa-enum-mappings.json` | Generated mappings |
| `backend/src/import/fitxa-enum-resolver.ts` | Lookup helper |
| `backend/scripts/generate-fitxa-mappings.js` | XLSX → JSON |
| `docs/fitxas-import-enums-reference.md` | All Prisma enum values + CA labels |
| `docs/fitxas-mapping-analysis.json` | Auto-match gap report |
