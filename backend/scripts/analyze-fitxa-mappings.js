/**
 * Reads Traducció etiquetes-Taules.xlsx and compares with SignBank Prisma enums.
 * Run: node backend/scripts/analyze-fitxa-mappings.js [path-to-xlsx]
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const root = path.join(__dirname, '..', '..');
const xlsxPath =
  process.argv[2] ||
  path.join(process.env.USERPROFILE || '', 'Downloads', 'Traducció etiquetes-Taules.xlsx');

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
    .toLowerCase();
}

function confFromOrdre(ordre, idConfig) {
  if (idConfig && /^[0-9]+[A-Za-z0-9]*$/i.test(String(idConfig).trim())) {
    const id = String(idConfig).trim();
    if (/^\d+$/.test(id)) return `CONF_${id}`;
    return `CONF_${id.toUpperCase()}`;
  }
  if (ordre === '' || ordre == null) return null;
  const n = String(ordre).trim();
  if (/^\d+$/.test(n)) return `CONF_${n}`;
  return null;
}

function locationFromEnglish(en) {
  if (!en || en === '----') return null;
  return en
    .trim()
    .replace(/\s*>\s*/g, '_TO_')
    .replace(/\s*\+\s*/g, '_AND_')
    .replace(/\s*\/\s*/g, '_OR_')
    .replace(/:/g, '')
    .replace(/'/g, '')
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase()
    .replace(/BACK_OF_HEAD/, 'BACK_OF_HEAD')
    .replace(/WEAK_HAND_INDEX_FINGER/, 'WEAK_HAND_INDEX_FINGER');
}

const wb = XLSX.readFile(xlsxPath);
const report = { sheets: wb.SheetNames, comparisons: {} };

// --- HandConfiguration ---
const confRows = sheetRows(wb, 'Configuracions');
const handConfs = extractEnum('HandConfiguration').filter((v) => v !== 'EMPTY');
const confMappings = [];
for (const row of confRows) {
  const ordre = row.ORDRE_ORDENACIO ?? row['ORDRE / ORDENACIO'];
  const idConfig = row.ID_CONFIGURACIO;
  const cat = row.CONFIGURACIO_CAT;
  const en = row['CONFIGURACIÓ_EN'] ?? row.CONFIGURACIO_EN;
  if (!cat && !en && !ordre) continue;
  const signbankId = confFromOrdre(ordre, idConfig);
  confMappings.push({
    sourceCat: cat,
    sourceEn: en,
    ordre,
    idConfig,
    signbankId,
    signbankMatch: signbankId ? handConfs.includes(signbankId) : false,
  });
}
const matchedConf = confMappings.filter((m) => m.signbankMatch);
const unmatchedConf = confMappings.filter((m) => m.signbankId && !m.signbankMatch);
const noIdConf = confMappings.filter((m) => !m.signbankId);
report.comparisons.HandConfiguration = {
  xlsxRows: confMappings.length,
  matched: matchedConf.length,
  unmatchedSignbankId: unmatchedConf,
  noSignbankId: noIdConf.length,
  prismaOnly: handConfs.filter(
    (c) => !confMappings.some((m) => m.signbankId === c),
  ),
};

// --- Hand (handedness) ---
const handRows = sheetRows(wb, 'Handedness-mans');
const handEnum = extractEnum('Hand');
report.comparisons.Hand = {
  note: 'XLSX uses 1/2a/2n/2s/x — SignBank uses RIGHT/LEFT/BOTH. Needs semantic mapping, not 1:1.',
  xlsxValues: handRows
    .map((r) => ({ code: r.ANGLÈS || r.ANGLÈS, cat: r.CATALÀ, en: r['DESCRIPCIÓ EN ANGLÈS'] }))
    .filter((r) => r.code),
  signbankEnum: handEnum,
};

// --- LexicalCategory ---
const lexRows = sheetRows(wb, 'Categoria lèxica');
const lexEnum = extractEnum('LexicalCategory');
const lexMap = [];
for (const row of lexRows) {
  const en = row.ANGLÈS;
  const cat = row.CATALÀ;
  if (!en) continue;
  const guess = en
    .toUpperCase()
    .replace(/[^A-Z]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  lexMap.push({ sourceEn: en, sourceCat: cat, guess, match: lexEnum.includes(guess) });
}
report.comparisons.LexicalCategory = {
  rows: lexMap,
  unmatched: lexMap.filter((r) => !r.match),
};

// --- RelationType ---
const relRows = sheetRows(wb, 'Tipus_relació_altres_signes');
const relEnum = extractEnum('RelationType');
report.comparisons.RelationType = {
  xlsxRows: relRows.filter((r) => r.CATALÀ || r.ANGLÈS),
  signbankEnum: relEnum,
};

// --- Location (sample match by English label) ---
const locRows = sheetRows(wb, 'Localitzacions');
const locEnum = extractEnum('Location').filter((v) => v !== 'EMPTY');
const locMappings = [];
for (const row of locRows) {
  const en = row.ANGLÈS;
  const cat = row.CATALÀ;
  if (!en || en === '----') continue;
  const guess = locationFromEnglish(en);
  locMappings.push({
    sourceEn: en,
    sourceCat: cat,
    guess,
    match: guess ? locEnum.includes(guess) : false,
  });
}
report.comparisons.Location = {
  xlsxRows: locMappings.length,
  matched: locMappings.filter((m) => m.match).length,
  unmatchedSamples: locMappings.filter((m) => !m.match).slice(0, 30),
  prismaOnlyCount: locEnum.filter((l) => !locMappings.some((m) => m.guess === l)).length,
};

// Generic sheets for phonology enums
const phonologySheets = [
  { sheet: 'Canvi de configuració', enum: 'ConfigurationChange', enCol: 'ANGLÈS', catCol: 'CATALÀ' },
  { sheet: 'Relació entre articuladors', enum: 'RelationBetweenArticulators', enCol: 'ANGLÈS', catCol: 'CATALÀ' },
  { sheet: 'Oirentació relativa_moviment', enum: 'MovementRelatedOrientation', enCol: 'ANGLÈS', catCol: 'CATALÀ' },
  { sheet: 'Orientació relativa_localitzaci', enum: 'OrientationRelatedToLocation', enCol: 'ANGLÈS', catCol: 'CATALÀ' },
  { sheet: 'Canvi_orientació', enum: 'OrientationChange', enCol: 'ANGLÈS', catCol: 'CATALÀ' },
  { sheet: 'Tipus_contacte', enum: 'ContactType', enCol: 'ANGLÈS', catCol: 'CATALÀ' },
  { sheet: 'Forma_moviment', enum: 'MovementType', enCol: 'ANGLÈS', catCol: 'CATALÀ' },
  { sheet: 'Direcció_moviment', enum: 'MovementDirection', enCol: 'ANGLÈS', catCol: 'CATALÀ' },
];

for (const { sheet, enum: enumName, enCol, catCol } of phonologySheets) {
  const rows = sheetRows(wb, sheet);
  const values = extractEnum(enumName).filter((v) => v !== 'EMPTY');
  const mapped = [];
  for (const row of rows) {
    const en = row[enCol];
    const cat = row[catCol];
    if (!en || en === '----' || en === '-------------') continue;
    const guess = en
      .toUpperCase()
      .replace(/\s*>\s*/g, '_TO_')
      .replace(/\s*\+\s*/g, '_AND_')
      .replace(/\s*\|\s*/g, '_OR_')
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    mapped.push({ sourceEn: en, sourceCat: cat, guess, match: values.includes(guess) });
  }
  report.comparisons[enumName] = {
    sheet,
    xlsxRows: mapped.length,
    matched: mapped.filter((m) => m.match).length,
    unmatchedSamples: mapped.filter((m) => !m.match).slice(0, 15),
    prismaOnlyCount: values.filter((v) => !mapped.some((m) => m.guess === v)).length,
  };
}

const outPath = path.join(root, 'docs/fitxas-mapping-analysis.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log('Analysis written to', outPath);
console.log('\nSummary:');
for (const [k, v] of Object.entries(report.comparisons)) {
  if (v.matched != null && v.xlsxRows != null) {
    console.log(`  ${k}: ${v.matched}/${v.xlsxRows} auto-matched`);
  } else if (v.rows) {
    console.log(`  ${k}: ${v.rows.filter((r) => r.match).length}/${v.rows.length} auto-matched`);
  } else {
    console.log(`  ${k}: see JSON`);
  }
}
