/**
 * One-off generator: Prisma phonology enums + i18n labels + fitxa aliases
 * → backend/src/phonology-values/phonology-catalog.defaults.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const mappings = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'backend/src/import/fitxa-enum-mappings.json'), 'utf8'),
);

const I18N_SECTION_TO_DIMENSION = {
  handedness: 'HANDEDNESS',
  handConfiguration: 'HAND_CONFIGURATION',
  configurationChange: 'CONFIGURATION_CHANGE',
  relationBetweenArticulators: 'RELATION_BETWEEN_ARTICULATORS',
  location: 'LOCATION',
  movementRelatedOrientation: 'MOVEMENT_RELATED_ORIENTATION',
  orientationRelatedToLocation: 'ORIENTATION_RELATED_TO_LOCATION',
  orientationChange: 'ORIENTATION_CHANGE',
  contactType: 'CONTACT_TYPE',
  movementType: 'MOVEMENT_TYPE',
  movementDirection: 'MOVEMENT_DIRECTION',
};

const MAPPING_FIELD_TO_DIMENSION = {
  handedness: 'HANDEDNESS',
  configuration: 'HAND_CONFIGURATION',
  configurationChanges: 'CONFIGURATION_CHANGE',
  relationBetweenArticulators: 'RELATION_BETWEEN_ARTICULATORS',
  location: 'LOCATION',
  movementRelatedOrientation: 'MOVEMENT_RELATED_ORIENTATION',
  orientationRelatedToLocation: 'ORIENTATION_RELATED_TO_LOCATION',
  orientationChange: 'ORIENTATION_CHANGE',
  contactType: 'CONTACT_TYPE',
  movementType: 'MOVEMENT_TYPE',
  movementDirection: 'MOVEMENT_DIRECTION',
};

const HANDEDNESS_FITXA_TO_CODE = {
  '1': 'ONE',
  '2a': 'TWO_A',
  '2n': 'TWO_N',
  '2s': 'TWO_S',
  x: 'NA',
};

const FALLBACK_CODES = {
  HANDEDNESS: ['ONE', 'TWO_A', 'TWO_N', 'TWO_S', 'NA'],
  HAND_CONFIGURATION: [],
  CONFIGURATION_CHANGE: [],
  RELATION_BETWEEN_ARTICULATORS: [],
  LOCATION: [],
  MOVEMENT_RELATED_ORIENTATION: [],
  ORIENTATION_RELATED_TO_LOCATION: [],
  ORIENTATION_CHANGE: [],
  CONTACT_TYPE: [],
  MOVEMENT_TYPE: [],
  MOVEMENT_DIRECTION: [],
};

function loadPhonologyI18n(rel) {
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const match = text.match(/const phonology[^=]*=\s*(\{[\s\S]*\});/);
  if (!match) throw new Error(`Could not parse ${rel}`);
  return Function(`"use strict"; return (${match[1]});`)();
}

function codesFromI18n(section) {
  return Object.keys(section).filter((k) => !k.endsWith('_description'));
}

function loadAliases() {
  const byDimCode = new Map();
  const add = (dimension, code, alias) => {
    if (!code || alias == null || alias === '') return;
    const key = `${dimension}:${code}`;
    if (!byDimCode.has(key)) byDimCode.set(key, new Set());
    byDimCode.get(key).add(String(alias));
  };

  for (const [field, dimension] of Object.entries(MAPPING_FIELD_TO_DIMENSION)) {
    const entries = mappings.fields[field]?.entries;
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      let code = entry.signbankId;
      if (!code && dimension === 'HANDEDNESS') {
        code = HANDEDNESS_FITXA_TO_CODE[String(entry.code)];
      }
      if (!code) continue;
      for (const alias of entry.aliases || []) add(dimension, code, alias);
      if (entry.code != null) add(dimension, code, entry.code);
    }
  }
  return byDimCode;
}

const ca = loadPhonologyI18n('frontend/src/i18n/ca-ES/phonology.ts');
const en = loadPhonologyI18n('frontend/src/i18n/en-US/phonology.ts');
const es = loadPhonologyI18n('frontend/src/i18n/es-ES/phonology.ts');
const aliases = loadAliases();

const defaults = [];
for (const [section, dimension] of Object.entries(I18N_SECTION_TO_DIMENSION)) {
  const caSection = ca.phonology[section] || {};
  const enSection = en.phonology[section] || {};
  const esSection = es.phonology[section] || {};
  const codes = codesFromI18n(caSection);
  const extra = FALLBACK_CODES[dimension].filter((c) => !codes.includes(c));
  const allCodes = [...codes, ...extra];
  allCodes.forEach((code, index) => {
    const key = `${dimension}:${code}`;
    const aliasSet = aliases.get(key) || new Set();
    defaults.push({
      dimension,
      code,
      labelCa: caSection[code] ?? code,
      labelEn: enSection[code] ?? null,
      labelEs: esSection[code] ?? null,
      descriptionCa: caSection[`${code}_description`] ?? null,
      descriptionEn: enSection[`${code}_description`] ?? null,
      descriptionEs: esSection[`${code}_description`] ?? null,
      aliases: [...aliasSet].sort(),
      sortOrder: index,
    });
  });
}

const outDir = path.join(ROOT, 'backend/src/phonology-values');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'phonology-catalog.defaults.json');
fs.writeFileSync(outFile, JSON.stringify(defaults, null, 2) + '\n');
console.log(`Wrote ${defaults.length} catalog entries to ${path.relative(ROOT, outFile)}`);
console.log(
  Object.entries(
    defaults.reduce((acc, row) => {
      acc[row.dimension] = (acc[row.dimension] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n'),
);
