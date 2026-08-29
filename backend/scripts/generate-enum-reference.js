const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const schema = fs.readFileSync(path.join(root, 'backend/prisma/schema.prisma'), 'utf8');
const caPhon = fs.readFileSync(path.join(root, 'frontend/src/i18n/ca-ES/phonology.ts'), 'utf8');
const caIndex = fs.readFileSync(path.join(root, 'frontend/src/i18n/ca-ES/index.ts'), 'utf8');

function extractEnum(name) {
  const re = new RegExp(`enum ${name} \\{([^}]+)\\}`, 's');
  const m = schema.match(re);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'));
}

function extractPhonLabels(section) {
  const start = caPhon.indexOf(`${section}:`);
  if (start < 0) return {};
  const sub = caPhon.slice(start);
  const end = sub.indexOf('\n    },');
  const body = sub.slice(0, end);
  const labels = {};
  for (const m of body.matchAll(/(\w+):\s*'((?:\\'|[^'])*)'/g)) {
    if (!m[1].endsWith('_description')) {
      labels[m[1]] = m[2].replace(/\\'/g, "'");
    }
  }
  return labels;
}

function indexLabel(key) {
  const m = caIndex.match(new RegExp(`${key}: '([^']*)'`));
  return m ? m[1] : '';
}

const importEnums = [
  'Language',
  'LexicalCategory',
  'RelationType',
  'Hand',
  'HandConfiguration',
  'ConfigurationChange',
  'RelationBetweenArticulators',
  'Location',
  'MovementRelatedOrientation',
  'OrientationRelatedToLocation',
  'OrientationChange',
  'ContactType',
  'MovementType',
  'MovementDirection',
];

const phonSections = {
  HandConfiguration: 'handConfiguration',
  ConfigurationChange: 'configurationChange',
  RelationBetweenArticulators: 'relationBetweenArticulators',
  Location: 'location',
  MovementRelatedOrientation: 'movementRelatedOrientation',
  OrientationRelatedToLocation: 'orientationRelatedToLocation',
  OrientationChange: 'orientationChange',
  ContactType: 'contactType',
  MovementType: 'movementType',
  MovementDirection: 'movementDirection',
};

let out = `# SignBank — Referència d'ENUMs per a la importació

Valors tancats definits a \`backend/prisma/schema.prisma\`. Les etiquetes en català són les que mostra l'aplicació avui (\`frontend/src/i18n/ca-ES/\`).

**Generat:** ${new Date().toISOString().slice(0, 10)}

Per cada valor cal decidir a la reunió:
- **A)** El JSON de les fitxes ja usa aquest vocabulari (o un de equivalent) → només cal una taula de correspondència.
- **B)** El vocabulari de les fitxes és diferent → cal definir el mapatge fitxa → SignBank, o ampliar els ENUMs de SignBank.

---

`;

for (const en of importEnums) {
  const vals = extractEnum(en);
  out += `## ${en} (${vals.length} valors)\n\n`;
  out += '| SignBank ID | Etiqueta UI (ca) | Notes reunió |\n';
  out += '|-------------|------------------|-------------|\n';
  const phon = phonSections[en];
  const labels = phon ? extractPhonLabels(phon) : {};
  for (const v of vals) {
    let label = labels[v] || '';
    if (!label && (en === 'LexicalCategory' || en === 'RelationType')) {
      label = indexLabel(v);
    }
    if (!label && en === 'Language') {
      label = { CATALAN: 'Català', SPANISH: 'Castellà', ENGLISH: 'Anglès', OTHER: 'Altre' }[v] || '';
    }
    if (!label && en === 'Hand') {
      label = { RIGHT: 'Mà dreta / dominant?', LEFT: 'Mà esquerra', BOTH: 'Ambdues mans' }[v] || '';
    }
    out += `| \`${v}\` | ${label.replace(/\|/g, '\\|')} | |\n`;
  }
  out += '\n';
}

fs.writeFileSync(path.join(root, 'docs/fitxas-import-enums-reference.md'), out);
console.log('Wrote docs/fitxas-import-enums-reference.md');
