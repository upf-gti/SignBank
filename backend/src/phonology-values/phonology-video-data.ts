import { PhonologyDimension, Prisma } from '@prisma/client';
import { VideoDataPhonologyInput } from './phonology-fields';

export const VIDEO_DATA_PHONOLOGY_RELATIONS = [
  { field: 'handedness', idField: 'handednessId', dimension: PhonologyDimension.HANDEDNESS, required: true, defaultCode: 'ONE' },
  { field: 'dominantConfiguration', idField: 'dominantConfigurationId', dimension: PhonologyDimension.HAND_CONFIGURATION, required: false },
  { field: 'nonDominantConfiguration', idField: 'nonDominantConfigurationId', dimension: PhonologyDimension.HAND_CONFIGURATION, required: false },
  { field: 'dominantRelationBetweenArticulators', idField: 'dominantRelationBetweenArticulatorsId', dimension: PhonologyDimension.RELATION_BETWEEN_ARTICULATORS, required: false },
  { field: 'nonDominantRelationBetweenArticulators', idField: 'nonDominantRelationBetweenArticulatorsId', dimension: PhonologyDimension.RELATION_BETWEEN_ARTICULATORS, required: false },
  { field: 'configurationChanges', idField: 'configurationChangesId', dimension: PhonologyDimension.CONFIGURATION_CHANGE, required: true, defaultCode: 'EMPTY' },
  { field: 'location', idField: 'locationId', dimension: PhonologyDimension.LOCATION, required: true, defaultCode: 'EMPTY' },
  { field: 'movementRelatedOrientation', idField: 'movementRelatedOrientationId', dimension: PhonologyDimension.MOVEMENT_RELATED_ORIENTATION, required: true, defaultCode: 'EMPTY' },
  { field: 'orientationRelatedToLocation', idField: 'orientationRelatedToLocationId', dimension: PhonologyDimension.ORIENTATION_RELATED_TO_LOCATION, required: true, defaultCode: 'EMPTY' },
  { field: 'orientationChange', idField: 'orientationChangeId', dimension: PhonologyDimension.ORIENTATION_CHANGE, required: true, defaultCode: 'EMPTY' },
  { field: 'contactType', idField: 'contactTypeId', dimension: PhonologyDimension.CONTACT_TYPE, required: true, defaultCode: 'EMPTY' },
  { field: 'movementType', idField: 'movementTypeId', dimension: PhonologyDimension.MOVEMENT_TYPE, required: true, defaultCode: 'EMPTY' },
  { field: 'movementDirection', idField: 'movementDirectionId', dimension: PhonologyDimension.MOVEMENT_DIRECTION, required: true, defaultCode: 'EMPTY' },
] as const;

export const VIDEO_DATA_ID_FIELDS = VIDEO_DATA_PHONOLOGY_RELATIONS.map((rel) => rel.idField);

export const videoDataPhonologyInclude = Object.fromEntries(
  VIDEO_DATA_PHONOLOGY_RELATIONS.map((rel) => [rel.field, true]),
) as Prisma.VideoDataInclude;

export function flattenVideoData<T extends Record<string, unknown>>(videoData: T): T {
  const result = { ...videoData };
  for (const rel of VIDEO_DATA_PHONOLOGY_RELATIONS) {
    const nested = result[rel.field];
    if (nested && typeof nested === 'object' && 'code' in nested) {
      (result as Record<string, unknown>)[rel.field] = (nested as { code: string }).code;
    }
    delete result[rel.idField];
  }
  return result;
}

export function flattenPhonologyInTree<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => flattenPhonologyInTree(item)) as T;
  }
  if (!value || typeof value !== 'object') {
    return value;
  }

  const obj = value as Record<string, unknown>;
  const looksLikeVideoData =
    'vocalization' in obj && ('handedness' in obj || 'handednessId' in obj);
  const next = looksLikeVideoData ? flattenVideoData(obj) : { ...obj };

  for (const [key, nested] of Object.entries(next)) {
    if (nested && typeof nested === 'object') {
      next[key] = flattenPhonologyInTree(nested);
    }
  }
  return next as T;
}

export function phonologyCode(value: unknown, fallback = ''): string {
  if (value == null || value === '') return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'code' in value) {
    const code = (value as { code: unknown }).code;
    return typeof code === 'string' ? code : fallback;
  }
  return fallback;
}

export function toSearchPhonology(videoData: unknown) {
  const data = (videoData ?? {}) as Record<string, unknown>;
  return {
    handedness: phonologyCode(data.handedness, 'ONE'),
    dominantConfiguration: phonologyCode(data.dominantConfiguration),
    nonDominantConfiguration: phonologyCode(data.nonDominantConfiguration),
    dominantRelationBetweenArticulators: phonologyCode(data.dominantRelationBetweenArticulators),
    nonDominantRelationBetweenArticulators: phonologyCode(
      data.nonDominantRelationBetweenArticulators,
    ),
    configurationChanges: phonologyCode(data.configurationChanges),
    location: phonologyCode(data.location),
    movementRelatedOrientation: phonologyCode(data.movementRelatedOrientation),
    orientationRelatedToLocation: phonologyCode(data.orientationRelatedToLocation),
    orientationChange: phonologyCode(data.orientationChange),
    contactType: phonologyCode(data.contactType),
    movementType: phonologyCode(data.movementType),
    movementDirection: phonologyCode(data.movementDirection),
    vocalization: typeof data.vocalization === 'string' ? data.vocalization : '',
    nonManualComponent: typeof data.nonManualComponent === 'string' ? data.nonManualComponent : '',
    inicialization: typeof data.inicialization === 'string' ? data.inicialization : '',
    repeatedMovement: Boolean(data.repeatedMovement),
  };
}

export function videoDataFromCodes(
  data: VideoDataPhonologyInput & {
    vocalization?: string;
    nonManualComponent?: string;
    inicialization?: string;
    repeatedMovement?: boolean;
    id?: string;
  },
): Prisma.VideoDataCreateInput {
  const create: Prisma.VideoDataCreateInput = {
    vocalization: data.vocalization ?? '',
    nonManualComponent: data.nonManualComponent ?? '',
    inicialization: data.inicialization ?? '',
    repeatedMovement: data.repeatedMovement ?? false,
    handedness: connectRequired('HANDEDNESS', data.handedness, 'ONE'),
    configurationChanges: connectRequired('CONFIGURATION_CHANGE', data.configurationChanges, 'EMPTY'),
    location: connectRequired('LOCATION', data.location, 'EMPTY'),
    movementRelatedOrientation: connectRequired(
      'MOVEMENT_RELATED_ORIENTATION',
      data.movementRelatedOrientation,
      'EMPTY',
    ),
    orientationRelatedToLocation: connectRequired(
      'ORIENTATION_RELATED_TO_LOCATION',
      data.orientationRelatedToLocation,
      'EMPTY',
    ),
    orientationChange: connectRequired('ORIENTATION_CHANGE', data.orientationChange, 'EMPTY'),
    contactType: connectRequired('CONTACT_TYPE', data.contactType, 'EMPTY'),
    movementType: connectRequired('MOVEMENT_TYPE', data.movementType, 'EMPTY'),
    movementDirection: connectRequired('MOVEMENT_DIRECTION', data.movementDirection, 'EMPTY'),
  };

  const optional = connectOptional('HAND_CONFIGURATION', data.dominantConfiguration);
  if (optional) create.dominantConfiguration = optional;
  const optionalNonDom = connectOptional('HAND_CONFIGURATION', data.nonDominantConfiguration);
  if (optionalNonDom) create.nonDominantConfiguration = optionalNonDom;
  const optionalDomRel = connectOptional(
    'RELATION_BETWEEN_ARTICULATORS',
    data.dominantRelationBetweenArticulators,
  );
  if (optionalDomRel) create.dominantRelationBetweenArticulators = optionalDomRel;
  const optionalNonDomRel = connectOptional(
    'RELATION_BETWEEN_ARTICULATORS',
    data.nonDominantRelationBetweenArticulators,
  );
  if (optionalNonDomRel) create.nonDominantRelationBetweenArticulators = optionalNonDomRel;

  if (data.id) create.id = data.id;
  return create;
}

export function videoDataUpdateFromCodes(
  data: VideoDataPhonologyInput & {
    vocalization?: string;
    nonManualComponent?: string;
    inicialization?: string;
    repeatedMovement?: boolean;
  },
): Prisma.VideoDataUpdateInput {
  const optionalField = (
    dimension: PhonologyDimension,
    code: string | null | undefined,
  ) =>
    code
      ? { connect: { dimension_code: { dimension, code } } }
      : { disconnect: true };

  return {
    vocalization: data.vocalization ?? '',
    nonManualComponent: data.nonManualComponent ?? '',
    inicialization: data.inicialization ?? '',
    repeatedMovement: data.repeatedMovement ?? false,
    handedness: optionalField('HANDEDNESS', data.handedness),
    configurationChanges: optionalField('CONFIGURATION_CHANGE', data.configurationChanges),
    location: optionalField('LOCATION', data.location),
    movementRelatedOrientation: optionalField(
      'MOVEMENT_RELATED_ORIENTATION',
      data.movementRelatedOrientation,
    ),
    orientationRelatedToLocation: optionalField(
      'ORIENTATION_RELATED_TO_LOCATION',
      data.orientationRelatedToLocation,
    ),
    orientationChange: optionalField('ORIENTATION_CHANGE', data.orientationChange),
    contactType: optionalField('CONTACT_TYPE', data.contactType),
    movementType: optionalField('MOVEMENT_TYPE', data.movementType),
    movementDirection: optionalField('MOVEMENT_DIRECTION', data.movementDirection),
    dominantConfiguration: optionalField('HAND_CONFIGURATION', data.dominantConfiguration),
    nonDominantConfiguration: optionalField('HAND_CONFIGURATION', data.nonDominantConfiguration),
    dominantRelationBetweenArticulators: optionalField(
      'RELATION_BETWEEN_ARTICULATORS',
      data.dominantRelationBetweenArticulators,
    ),
    nonDominantRelationBetweenArticulators: optionalField(
      'RELATION_BETWEEN_ARTICULATORS',
      data.nonDominantRelationBetweenArticulators,
    ),
  };
}

function connectRequired(
  dimension: PhonologyDimension,
  code: string | null | undefined,
  fallback: string,
) {
  return {
    connect: {
      dimension_code: {
        dimension,
        code: code || fallback,
      },
    },
  };
}

function connectOptional(
  dimension: PhonologyDimension,
  code: string | null | undefined,
) {
  if (!code) return undefined;
  return {
    connect: {
      dimension_code: { dimension, code },
    },
  };
}
