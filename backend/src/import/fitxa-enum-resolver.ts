import * as fs from 'fs';
import * as path from 'path';

const mappings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fitxa-enum-mappings.json'), 'utf8'),
) as typeof import('./fitxa-enum-mappings.json');

export type FitxaMappingField = keyof typeof mappings.fields;

export interface EnumResolveResult<T = string> {
  value: T | null;
  field: FitxaMappingField;
  input: string;
}

function normalize(input: string): string {
  return input
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function stripCompoundPrefix(input: string): string {
  return input.replace(/^\d+n\s+comp:\s*/i, '').trim();
}

function buildAliasIndex(
  entries: Array<{ signbankId?: string; value?: boolean; aliases: string[] }>,
  valueKey: 'signbankId' | 'value' = 'signbankId',
): Map<string, string | boolean> {
  const index = new Map<string, string | boolean>();
  for (const entry of entries) {
    const value = entry[valueKey];
    if (value === undefined) continue;
    for (const alias of entry.aliases) {
      index.set(normalize(alias), value);
    }
  }
  return index;
}

const aliasIndexes: Partial<Record<FitxaMappingField, Map<string, string | boolean>>> = {};

function getIndex(field: FitxaMappingField): Map<string, string | boolean> {
  if (!aliasIndexes[field]) {
    const fieldData = mappings.fields[field];
    if (!fieldData?.entries) return new Map();
    const valueKey = field === 'repeatedMovement' ? 'value' : 'signbankId';
    aliasIndexes[field] = buildAliasIndex(fieldData.entries as any, valueKey as any);
  }
  return aliasIndexes[field]!;
}

/** Resolve a scraped label to a SignBank enum ID (or boolean for repeatedMovement). */
export function resolveFitxaEnum(
  field: FitxaMappingField,
  raw: string | null | undefined,
): EnumResolveResult {
  const input = String(raw ?? '').trim();
  if (!input) return { value: null, field, input };

  const index = getIndex(field);
  const candidates = [input, stripCompoundPrefix(input)];

  for (const candidate of candidates) {
    const hit = index.get(normalize(candidate));
    if (hit !== undefined) {
      return { value: hit as string, field, input };
    }
  }

  return { value: null, field, input };
}

/** Map JSON phonology block to SignBank VideoData enum fields. */
export function mapPhonologyFromFitxa(phonology: Record<string, unknown>) {
  const fieldMap: Array<[FitxaMappingField, string]> = [
    ['configuration', 'configuracio'],
    ['configurationChanges', 'canvi_configuracio'],
    ['relationBetweenArticulators', 'relacio_articuladors'],
    ['location', 'localitzacio'],
    ['movementRelatedOrientation', 'orientacio_moviment'],
    ['orientationRelatedToLocation', 'orientacio_localitzacio'],
    ['orientationChange', 'canvi_orientacio'],
    ['contactType', 'tipus_contacte'],
    ['movementType', 'forma_moviment'],
    ['movementDirection', 'direccio_moviment'],
  ];

  const result: Record<string, EnumResolveResult> = {};
  for (const [field, jsonKey] of fieldMap) {
    result[jsonKey] = resolveFitxaEnum(field, phonology[jsonKey] as string);
  }

  const repeated = resolveFitxaEnum('repeatedMovement', phonology.moviment_repetit as string);
  result.moviment_repetit = repeated;

  return result;
}

export { mappings };
