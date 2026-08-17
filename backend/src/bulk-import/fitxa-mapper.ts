import { Handedness } from '@prisma/client';
import {
  resolveFitxaEnum,
  type FitxaMappingField,
} from '../import/fitxa-enum-resolver';
import type {
  FitxaJson,
  FitxaPhonology,
  ImportIssue,
  MappedFitxa,
  MappedPhonology,
} from './fitxa.types';

const PHONOLOGY_FIELDS: Array<{
  jsonKey: keyof FitxaPhonology;
  mappingField: FitxaMappingField;
  videoDataKey: keyof MappedPhonology;
}> = [
  { jsonKey: 'canvi_configuracio', mappingField: 'configurationChanges', videoDataKey: 'configurationChanges' },
  { jsonKey: 'localitzacio', mappingField: 'location', videoDataKey: 'location' },
  { jsonKey: 'orientacio_moviment', mappingField: 'movementRelatedOrientation', videoDataKey: 'movementRelatedOrientation' },
  { jsonKey: 'orientacio_localitzacio', mappingField: 'orientationRelatedToLocation', videoDataKey: 'orientationRelatedToLocation' },
  { jsonKey: 'canvi_orientacio', mappingField: 'orientationChange', videoDataKey: 'orientationChange' },
  { jsonKey: 'tipus_contacte', mappingField: 'contactType', videoDataKey: 'contactType' },
  { jsonKey: 'forma_moviment', mappingField: 'movementType', videoDataKey: 'movementType' },
  { jsonKey: 'direccio_moviment', mappingField: 'movementDirection', videoDataKey: 'movementDirection' },
];

const ENUM_FALLBACKS: Record<string, Record<string, string>> = {
  configuration: {
    'b (b)': 'CONF_21',
    'o_ssi (o)': 'CONF_3',
    'q (beak)': 'CONF_33',
  },
  relationBetweenArticulators: {
    'damunt / sota': 'ABOVE_BELOW',
    'damunt /sota': 'ABOVE_BELOW',
  },
  location: {
    'ma no-dominant': 'WEAK_HAND',
    'ma no dominant': 'WEAK_HAND',
    'espai neutre': 'NEUTRAL_SPACE',
    'boca': 'MOUTH',
  },
  orientationRelatedToLocation: {
    'ao: palm-down': 'AO_PALM_DOWN',
    'ao: palmell-avall': 'AO_PALM_DOWN',
  },
  movementDirection: {
    'cap a la localitzacio': 'TOWARDS_LOCATION',
  },
  orientationChange: {
    'extensio > flexio': 'EXTENSION_TO_FLEXION',
    'flexio > extensio': 'FLEXION_TO_EXTENSION',
  },
};

const RELATION_KEY_FALLBACK: Record<string, string> = {
  sinonim: 'SYNONYM',
  antonim: 'ANTONYM',
  homonim: 'HOMONYM',
  variant: 'VARIANT',
  hiperonim: 'HYPERNYM',
  hiponim: 'HYPONYM',
  'veure tambe': 'ASSOCIATED_CONCEPT',
};

const LEXICAL_PREFIX: Array<{ prefix: RegExp; category: string }> = [
  { prefix: /^adj(?:ectiu)?\s*[-–—]/i, category: 'ADJECTIVE' },
  { prefix: /^verb\s*[-–—]/i, category: 'VERB' },
  { prefix: /^nom\s*[-–—]/i, category: 'NOUN' },
  { prefix: /^adverbi\s*[-–—]/i, category: 'ADVERB' },
];

function normalize(input: string): string {
  return input
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function splitCandidates(raw: string): string[] {
  const trimmed = raw.trim();
  const parts = trimmed
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  return [trimmed, ...parts.filter((part) => part !== trimmed)];
}

function resolveEnumValue(
  field: FitxaMappingField,
  raw: string | null | undefined,
  gloss: string,
  fileName: string,
  jsonField: string,
  issues: ImportIssue[],
  emptyValue: string,
): string {
  if (raw == null || String(raw).trim() === '') {
    return emptyValue;
  }

  const original = String(raw).trim();
  for (const candidate of splitCandidates(original)) {
    const resolved = resolveFitxaEnum(field, candidate);
    if (resolved.value) {
      return String(resolved.value);
    }

    const fallback = ENUM_FALLBACKS[String(field)]?.[normalize(candidate)];
    if (fallback) {
      return fallback;
    }
  }

  issues.push({
    gloss,
    fileName,
    field: jsonField,
    value: original,
    message: `Invalid enum value for ${jsonField}`,
  });
  return emptyValue;
}

function mapHandedness(
  raw: string | null | undefined,
  gloss: string,
  fileName: string,
  issues: ImportIssue[],
): Handedness {
  if (raw == null || String(raw).trim() === '') {
    return Handedness.ONE;
  }

  const resolved = resolveFitxaEnum('handedness', raw);
  if (resolved.value) {
    return resolved.value as Handedness;
  }

  issues.push({
    gloss,
    fileName,
    field: 'phonology.nombre_mans',
    value: String(raw),
    message: 'Invalid handedness code; stored as ONE',
  });
  return Handedness.ONE;
}

function mapLexicalCategory(
  raw: string | null | undefined,
  gloss: string,
  fileName: string,
  issues: ImportIssue[],
  fallback = 'NOUN',
): string {
  if (raw == null || String(raw).trim() === '') {
    return fallback;
  }

  const resolved = resolveFitxaEnum('lexicalCategory', raw);
  if (resolved.value) {
    return String(resolved.value);
  }

  const normalized = normalize(String(raw));
  if (normalized === 'nom o verb') return 'NOUN_OR_VERB';
  if (normalized === 'adjectiu') return 'ADJECTIVE';
  if (normalized === 'nom') return 'NOUN';
  if (normalized === 'verb') return 'VERB';
  if (normalized === 'preposicio o adjectiu') return 'PARTICLE_OR_ADJECTIVE';
  if (normalized === 'nom, verb o adverbi') return 'NOUN_VERB_OR_ADVERB';

  issues.push({
    gloss,
    fileName,
    field: 'lexical_category',
    value: String(raw),
    message: 'Invalid lexical category; stored as NOUN',
  });
  return fallback;
}

function parseDefinitionLine(
  line: string,
  gloss: string,
  fileName: string,
  issues: ImportIssue[],
  defaultCategory: string,
) {
  const trimmed = line.trim();
  let category = defaultCategory;
  let text = trimmed;
  let title: string | null = null;

  for (const { prefix, category: mapped } of LEXICAL_PREFIX) {
    if (prefix.test(trimmed)) {
      category = mapped;
      text = trimmed.replace(prefix, '').trim();
      title = trimmed.split(/[-–—]/)[0].trim();
      break;
    }
  }

  if (!text) {
    issues.push({
      gloss,
      fileName,
      field: 'definitions',
      value: line,
      message: 'Empty definition text after parsing',
    });
  }

  return { title, definition: text || trimmed, lexicalCategory: category };
}

function splitTranslations(raw: string | null | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
}

function mapRelationType(
  key: string,
  gloss: string,
  fileName: string,
  issues: ImportIssue[],
): string | null {
  const resolved = resolveFitxaEnum('relationType', key);
  if (resolved.value) {
    return String(resolved.value);
  }

  const fallback = RELATION_KEY_FALLBACK[normalize(key)];
  if (fallback) {
    return fallback;
  }

  issues.push({
    gloss,
    fileName,
    field: `related_signs.${key}`,
    value: key,
    message: 'Unknown relation type; relation skipped',
  });
  return null;
}

function collectLinkedNames(fitxa: FitxaJson): string[] {
  const names = new Set<string>();

  for (const targets of Object.values(fitxa.related_signs || {})) {
    for (const name of targets || []) {
      if (name?.trim()) names.add(name.trim());
    }
  }

  for (const pair of fitxa.minimal_pairs || []) {
    if (pair.sign?.trim()) names.add(pair.sign.trim());
  }

  for (const name of fitxa.compound_signs || []) {
    if (name?.trim()) names.add(name.trim());
  }

  const morphology = fitxa.morfologia_sequencial;
  for (const part of [morphology?.compost_1, morphology?.compost_2, morphology?.compost_3]) {
    if (part?.trim()) names.add(part.trim());
  }

  return [...names];
}

function mapPhonology(
  phonology: FitxaPhonology | undefined,
  gloss: string,
  fileName: string,
  issues: ImportIssue[],
): MappedPhonology | null {
  if (!phonology) {
    return null;
  }

  const mapped: MappedPhonology = {
    handedness: mapHandedness(phonology.nombre_mans, gloss, fileName, issues),
    dominantConfiguration: resolveEnumValue(
      'configuration',
      phonology.configuracio_ma_dominant || phonology.configuracio,
      gloss,
      fileName,
      'phonology.configuracio_ma_dominant',
      issues,
      'EMPTY',
    ),
    nonDominantConfiguration: phonology.configuracio_ma_no_dominant
      ? resolveEnumValue(
          'configuration',
          phonology.configuracio_ma_no_dominant,
          gloss,
          fileName,
          'phonology.configuracio_ma_no_dominant',
          issues,
          'EMPTY',
        )
      : null,
    dominantRelationBetweenArticulators: resolveEnumValue(
      'relationBetweenArticulators',
      phonology.relacio_articuladors_ma_dominant || phonology.relacio_articuladors,
      gloss,
      fileName,
      'phonology.relacio_articuladors_ma_dominant',
      issues,
      'EMPTY',
    ),
    nonDominantRelationBetweenArticulators: phonology.relacio_articuladors_ma_no_dominant
      ? resolveEnumValue(
          'relationBetweenArticulators',
          phonology.relacio_articuladors_ma_no_dominant,
          gloss,
          fileName,
          'phonology.relacio_articuladors_ma_no_dominant',
          issues,
          'EMPTY',
        )
      : null,
    configurationChanges: 'EMPTY',
    location: 'EMPTY',
    movementRelatedOrientation: 'EMPTY',
    orientationRelatedToLocation: 'EMPTY',
    orientationChange: 'EMPTY',
    contactType: 'EMPTY',
    movementType: 'EMPTY',
    movementDirection: 'EMPTY',
    vocalization: phonology.vocalitzacio?.trim() || '',
    nonManualComponent: phonology.component_no_manual?.trim() || '',
    inicialization: '',
    repeatedMovement: false,
  };

  for (const { jsonKey, mappingField, videoDataKey } of PHONOLOGY_FIELDS) {
    mapped[videoDataKey] = resolveEnumValue(
      mappingField,
      phonology[jsonKey],
      gloss,
      fileName,
      `phonology.${String(jsonKey)}`,
      issues,
      'EMPTY',
    ) as never;
  }

  const repeated = resolveFitxaEnum('repeatedMovement', phonology.moviment_repetit);
  if (phonology.moviment_repetit && repeated.value == null) {
    issues.push({
      gloss,
      fileName,
      field: 'phonology.moviment_repetit',
      value: String(phonology.moviment_repetit),
      message: 'Invalid repeated movement value; stored as false',
    });
  }
  mapped.repeatedMovement = Boolean(repeated.value);

  return mapped;
}

export function mapFitxa(fitxa: FitxaJson, fileName: string): MappedFitxa | { error: ImportIssue } {
  const gloss = fitxa.name?.trim();
  if (!gloss) {
    return {
      error: {
        gloss: '',
        fileName,
        field: 'name',
        value: '',
        message: 'Missing gloss name',
      },
    };
  }

  const issues: ImportIssue[] = [];
  const defaultCategory = mapLexicalCategory(
    fitxa.lexical_category,
    gloss,
    fileName,
    issues,
  );

  const definitionLines = (fitxa.definitions?.length ? fitxa.definitions : fitxa.definition ? [fitxa.definition] : [])
    .map((line) => line.trim())
    .filter(Boolean);

  const definitions = definitionLines.map((line) =>
    parseDefinitionLine(line, gloss, fileName, issues, defaultCategory),
  );

  const translations: MappedFitxa['translations'] = [];
  for (const translation of splitTranslations(fitxa.tr_ca)) {
    translations.push({ language: 'CATALAN', translation });
  }
  for (const translation of splitTranslations(fitxa.tr_es)) {
    translations.push({ language: 'SPANISH', translation });
  }
  for (const translation of splitTranslations(fitxa.tr_en)) {
    translations.push({ language: 'ENGLISH', translation });
  }

  const relations: MappedFitxa['relations'] = [];
  for (const [key, targets] of Object.entries(fitxa.related_signs || {})) {
    const type = mapRelationType(key, gloss, fileName, issues);
    if (!type) continue;
    for (const target of targets || []) {
      if (target?.trim() && target.trim() !== gloss) {
        relations.push({ type, targetGloss: target.trim() });
      }
    }
  }

  const minimalPairs: MappedFitxa['minimalPairs'] = [];
  for (const pair of fitxa.minimal_pairs || []) {
    if (!pair.sign?.trim()) continue;
    minimalPairs.push({
      targetGloss: pair.sign.trim(),
      distinction: pair.description?.trim() || '',
    });
  }

  const phonology = mapPhonology(fitxa.phonology, gloss, fileName, issues);
  const hasVideo = Boolean(fitxa.video_url?.trim());

  return {
    fileName,
    gloss,
    notes: fitxa.notes?.trim() || null,
    translations,
    definitions,
    phonology: phonology || (hasVideo ? mapPhonology({}, gloss, fileName, issues) : null),
    videoUrl: fitxa.video_url?.trim() || null,
    relations,
    minimalPairs,
    linkedGlossNames: collectLinkedNames(fitxa),
    issues,
  };
}
