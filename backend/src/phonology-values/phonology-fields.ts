import { PhonologyDimension } from '@prisma/client';

export const PHONOLOGY_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_]*$/;

export type VideoDataPhonologyInput = {
  handedness?: string | null;
  dominantConfiguration?: string | null;
  nonDominantConfiguration?: string | null;
  dominantRelationBetweenArticulators?: string | null;
  nonDominantRelationBetweenArticulators?: string | null;
  configurationChanges?: string | null;
  location?: string | null;
  movementRelatedOrientation?: string | null;
  orientationRelatedToLocation?: string | null;
  orientationChange?: string | null;
  contactType?: string | null;
  movementType?: string | null;
  movementDirection?: string | null;
};

export const VIDEO_DATA_ID_FIELDS_BY_DIMENSION: Record<
  PhonologyDimension,
  string[]
> = {
  HANDEDNESS: ['handednessId'],
  HAND_CONFIGURATION: ['dominantConfigurationId', 'nonDominantConfigurationId'],
  CONFIGURATION_CHANGE: ['configurationChangesId'],
  RELATION_BETWEEN_ARTICULATORS: [
    'dominantRelationBetweenArticulatorsId',
    'nonDominantRelationBetweenArticulatorsId',
  ],
  LOCATION: ['locationId'],
  MOVEMENT_RELATED_ORIENTATION: ['movementRelatedOrientationId'],
  ORIENTATION_RELATED_TO_LOCATION: ['orientationRelatedToLocationId'],
  ORIENTATION_CHANGE: ['orientationChangeId'],
  CONTACT_TYPE: ['contactTypeId'],
  MOVEMENT_TYPE: ['movementTypeId'],
  MOVEMENT_DIRECTION: ['movementDirectionId'],
};

export const FIELD_TO_DIMENSION: Record<keyof VideoDataPhonologyInput, PhonologyDimension> = {
  handedness: PhonologyDimension.HANDEDNESS,
  dominantConfiguration: PhonologyDimension.HAND_CONFIGURATION,
  nonDominantConfiguration: PhonologyDimension.HAND_CONFIGURATION,
  dominantRelationBetweenArticulators: PhonologyDimension.RELATION_BETWEEN_ARTICULATORS,
  nonDominantRelationBetweenArticulators: PhonologyDimension.RELATION_BETWEEN_ARTICULATORS,
  configurationChanges: PhonologyDimension.CONFIGURATION_CHANGE,
  location: PhonologyDimension.LOCATION,
  movementRelatedOrientation: PhonologyDimension.MOVEMENT_RELATED_ORIENTATION,
  orientationRelatedToLocation: PhonologyDimension.ORIENTATION_RELATED_TO_LOCATION,
  orientationChange: PhonologyDimension.ORIENTATION_CHANGE,
  contactType: PhonologyDimension.CONTACT_TYPE,
  movementType: PhonologyDimension.MOVEMENT_TYPE,
  movementDirection: PhonologyDimension.MOVEMENT_DIRECTION,
};

export function normalizePhonologyCode(code: string): string {
  return code.trim().replace(/[\s-]+/g, '_').toUpperCase();
}
