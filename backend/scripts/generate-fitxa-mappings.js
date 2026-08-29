/**
 * Generates canonical fitxa → SignBank enum mappings from Traducció etiquetes-Taules.xlsx
 *
 * Run:
 *   node backend/scripts/generate-fitxa-mappings.js [path-to-xlsx]
 *
 * Output:
 *   backend/src/import/fitxa-enum-mappings.json
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const root = path.join(__dirname, '..', '..');
const xlsxPath =
  process.argv[2] ||
  path.join(process.env.USERPROFILE || '', 'Downloads', 'Traducció etiquetes-Taules.xlsx');
const outDir = path.join(root, 'backend/src/import');
const outPath = path.join(outDir, 'fitxa-enum-mappings.json');

const schema = fs.readFileSync(path.join(root, 'backend/prisma/schema.prisma'), 'utf8');

function extractEnum(name) {
  const re = new RegExp(`enum ${name} \\{([^}]+)\\}`, 's');
  const m = schema.match(re);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'));
}

function sheetRows(wb, name) {
  const sheet = wb.Sheets[name];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function norm(s) {
  return String(s ?? '')
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function enToEnumKey(en) {
  if (!en || en === '----' || en === '---' || en === '-------------') return null;
  return en
    .trim()
    .replace(/\s*>\s*/g, '_TO_')
    .replace(/\s*\+\s*/g, '_AND_')
    .replace(/\s*\/\s*/g, '_OR_')
    .replace(/\s*\|\s*/g, '_OR_')
    .replace(/:/g, '')
    .replace(/'/g, '')
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();
}

function confSignbankId(ordre, idConfig) {
  const ordreStr = String(ordre ?? '').trim();
  if (/^\d+$/.test(ordreStr)) return `CONF_${ordreStr}`;

  const id = String(idConfig ?? '').trim();
  if (!id || id.startsWith('http')) return null;
  if (/^\d+$/.test(id)) return `CONF_${id}`;
  if (/^[0-9A-Za-z]+$/.test(id)) return `CONF_${id.toUpperCase()}`;

  return null;
}

function addEntry(map, signbankId, aliases) {
  if (!signbankId) return;
  if (!map[signbankId]) {
    map[signbankId] = { signbankId, aliases: new Set() };
  }
  for (const a of aliases) {
    const key = norm(a);
    if (key) map[signbankId].aliases.add(key);
  }
}

function finalize(map) {
  return Object.values(map)
    .map((e) => ({
      signbankId: e.signbankId,
      aliases: [...e.aliases].sort(),
    }))
    .sort((a, b) => a.signbankId.localeCompare(b.signbankId));
}

function buildSimpleEnumMap(wb, sheetName, enumName, extra = {}) {
  const rows = sheetRows(wb, sheetName);
  const allowed = new Set(extractEnum(enumName));
  const bySignbank = {};
  const unmapped = [];

  for (const row of rows) {
    const en = row.ANGLÈS;
    const cat = row.CATALÀ;
    if (!en || en === '----' || en === '---') continue;

    const signbankId = enToEnumKey(en);
    const aliases = [en, cat, en.replace(/\+/g, ' + '), en.replace(/>/g, ' > ')];
    if (cat) aliases.push(cat);

    if (signbankId && allowed.has(signbankId)) {
      addEntry(bySignbank, signbankId, aliases);
    } else {
      unmapped.push({ sourceEn: en, sourceCa: cat, guessedId: signbankId });
    }
  }

  return {
    enum: enumName,
    sheet: sheetName,
    entries: finalize(bySignbank),
    unmapped,
    ...extra,
  };
}

const wb = XLSX.readFile(xlsxPath);
const output = {
  meta: {
    generatedAt: new Date().toISOString(),
    sourceFile: path.basename(xlsxPath),
    description:
      'Maps fitxa/scraper labels (CA/EN) to SignBank Prisma enum IDs. Lookup: normalize input, match aliases[].',
  },
  fields: {},
};

// Handedness — fitxa taxonomy (NOT SignBank Hand enum)
const handednessRows = sheetRows(wb, 'Handedness-mans');
output.fields.handedness = {
  note: 'JSON field phonology.nombre_mans. SignBank Hand (RIGHT/LEFT/BOTH) is a different concept — store handedness code separately or extend schema.',
  entries: handednessRows
    .filter((r) => r.ANGLÈS)
    .map((r) => ({
      code: String(r.ANGLÈS).trim(),
      labelCa: r.CATALÀ,
      labelEn: r['DESCRIPCIÓ EN ANGLÈS'] || r.DESCRIPCIÓ,
      aliases: [...new Set([r.ANGLÈS, r.CATALÀ].filter(Boolean).map(norm))],
    })),
};

// HandConfiguration — from Configuracions sheet
const confRows = sheetRows(wb, 'Configuracions');
const confAllowed = new Set(extractEnum('HandConfiguration'));
const confBySignbank = {};
const confUnmapped = [];
for (const row of confRows) {
  const cat = row.CONFIGURACIO_CAT;
  const en = row['CONFIGURACIÓ_EN'] ?? row.CONFIGURACIO_EN;
  const ordre = row.ORDRE_ORDENACIO;
  const idConfig = row.ID_CONFIGURACIO;
  if (!cat && !en && !ordre) continue;

  const signbankId = confSignbankId(ordre, idConfig);
  const catStr = String(cat || '').trim();
  const enStr = String(en || '').trim();
  const aliases = [catStr, enStr, `${catStr} (${enStr})`, `${enStr} (${catStr})`].filter(Boolean);
  if (catStr && enStr) {
    aliases.push(`${catStr.toUpperCase()} (${enStr})`);
  }

  if (signbankId && confAllowed.has(signbankId)) {
    addEntry(confBySignbank, signbankId, aliases);
  } else {
    confUnmapped.push({ cat, en, ordre, idConfig, signbankId });
  }
}
output.fields.configuration = {
  enum: 'HandConfiguration',
  jsonField: 'phonology.configuracio',
  alsoMaps: ['configuracio_ma_dominant', 'configuracio_ma_no_dominant'],
  entries: finalize(confBySignbank),
  unmapped: confUnmapped,
};

// Standard phonology enums from English-keyed sheets
const phonologySheets = [
  { key: 'configurationChanges', enum: 'ConfigurationChange', sheet: 'Canvi de configuració', jsonField: 'phonology.canvi_configuracio' },
  { key: 'relationBetweenArticulators', enum: 'RelationBetweenArticulators', sheet: 'Relació entre articuladors', jsonField: 'phonology.relacio_articuladors' },
  { key: 'location', enum: 'Location', sheet: 'Localitzacions', jsonField: 'phonology.localitzacio' },
  { key: 'movementRelatedOrientation', enum: 'MovementRelatedOrientation', sheet: 'Oirentació relativa_moviment', jsonField: 'phonology.orientacio_moviment' },
  { key: 'orientationRelatedToLocation', enum: 'OrientationRelatedToLocation', sheet: 'Orientació relativa_localitzaci', jsonField: 'phonology.orientacio_localitzacio' },
  { key: 'orientationChange', enum: 'OrientationChange', sheet: 'Canvi_orientació', jsonField: 'phonology.canvi_orientacio' },
  { key: 'contactType', enum: 'ContactType', sheet: 'Tipus_contacte', jsonField: 'phonology.tipus_contacte' },
  { key: 'movementType', enum: 'MovementType', sheet: 'Forma_moviment', jsonField: 'phonology.forma_moviment' },
  { key: 'movementDirection', enum: 'MovementDirection', sheet: 'Direcció_moviment', jsonField: 'phonology.direccio_moviment' },
];

for (const { key, enum: enumName, sheet, jsonField } of phonologySheets) {
  output.fields[key] = {
    ...buildSimpleEnumMap(wb, sheet, enumName),
    jsonField,
  };
}

// Lexical category — manual fixes for typos + Catalan fitxa labels
const lexManual = {
  INETERJECTION: 'INTERJECTION',
  PARTICLE_NOUN_OR_VERB: 'PARTICLE_NOUN_OR_VERB',
  VERB_AND_ADJECTIVE: 'VERB_OR_ADJECTIVE',
  ADJECTIVE_AND_VERB: 'VERB_OR_ADJECTIVE',
  ADVERB_AND_ADJECTIVE: 'ADJECTIVE_OR_ADVERB',
  ADVERB_AND_VERB: 'VERB_OR_ADVERB',
  VERB_AND_ADVERB: 'VERB_OR_ADVERB',
};
const lexRows = sheetRows(wb, 'Categoria lèxica');
const lexAllowed = new Set(extractEnum('LexicalCategory'));
const lexBySignbank = {};
const lexUnmapped = [];
for (const row of lexRows) {
  const en = row.ANGLÈS;
  const cat = row.CATALÀ;
  if (!en) continue;
  let signbankId = enToEnumKey(en);
  if (lexManual[signbankId]) signbankId = lexManual[signbankId];
  if (signbankId && lexAllowed.has(signbankId)) {
    addEntry(lexBySignbank, signbankId, [en, cat, cat?.replace(/ o /gi, ' o ')]);
  } else {
    lexUnmapped.push({ sourceEn: en, sourceCa: cat, guessedId: signbankId });
  }
}
output.fields.lexicalCategory = {
  enum: 'LexicalCategory',
  jsonField: 'lexical_category',
  entries: finalize(lexBySignbank),
  unmapped: lexUnmapped,
};

// Relation types
const relManual = {
  ALL: null,
  SEE_ALSO: 'ASSOCIATED_CONCEPT',
};
const relRows = sheetRows(wb, 'Tipus_relació_altres_signes');
const relAllowed = new Set(extractEnum('RelationType'));
const relBySignbank = {};
const relUnmapped = [];
for (const row of relRows) {
  const en = row.ANGLÈS;
  const cat = row.CATALÀ;
  if (!en || en === '---') continue;
  let signbankId = enToEnumKey(en);
  if (relManual[signbankId] !== undefined) signbankId = relManual[signbankId];
  const jsonKeys = {
    SYNONYM: 'SINÒNIM',
    ANTONYM: 'ANTÒNIM',
    HOMONYM: 'HOMÒNIM',
    VARIANT: 'VARIANT',
    HYPERNYM: 'HIPERÒNIM',
    HYPONYM: 'HIPÒNIM',
    ASSOCIATED_CONCEPT: 'VEURE TAMBÉ',
  };
  const aliases = [en, cat, jsonKeys[signbankId]].filter(Boolean);
  if (signbankId && relAllowed.has(signbankId)) {
    addEntry(relBySignbank, signbankId, aliases);
  } else if (signbankId) {
    relUnmapped.push({ sourceEn: en, sourceCa: cat, guessedId: signbankId });
  }
}
output.fields.relationType = {
  enum: 'RelationType',
  jsonField: 'related_signs',
  entries: finalize(relBySignbank),
  unmapped: relUnmapped,
};

// Boolean helpers
output.fields.repeatedMovement = {
  jsonField: 'phonology.moviment_repetit',
  entries: [
    { value: true, aliases: ['sí', 'si', 's', 'yes', 'true', '1'] },
    { value: false, aliases: ['no', 'n', 'false', '0'] },
  ],
};

// Summary stats
output.summary = {};
for (const [key, field] of Object.entries(output.fields)) {
  if (field.entries) {
    output.summary[key] = {
      mapped: field.entries.length,
      aliasCount: field.entries.reduce((n, e) => n + (e.aliases?.length || 0), 0),
      unmapped: field.unmapped?.length || 0,
    };
  }
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log('Wrote', outPath);
console.log(JSON.stringify(output.summary, null, 2));
