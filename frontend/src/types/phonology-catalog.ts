export type PhonologyDimension =
  | 'HANDEDNESS'
  | 'HAND_CONFIGURATION'
  | 'CONFIGURATION_CHANGE'
  | 'RELATION_BETWEEN_ARTICULATORS'
  | 'LOCATION'
  | 'MOVEMENT_RELATED_ORIENTATION'
  | 'ORIENTATION_RELATED_TO_LOCATION'
  | 'ORIENTATION_CHANGE'
  | 'CONTACT_TYPE'
  | 'MOVEMENT_TYPE'
  | 'MOVEMENT_DIRECTION';

export const PHONOLOGY_DIMENSIONS: PhonologyDimension[] = [
  'HANDEDNESS',
  'HAND_CONFIGURATION',
  'CONFIGURATION_CHANGE',
  'RELATION_BETWEEN_ARTICULATORS',
  'LOCATION',
  'MOVEMENT_RELATED_ORIENTATION',
  'ORIENTATION_RELATED_TO_LOCATION',
  'ORIENTATION_CHANGE',
  'CONTACT_TYPE',
  'MOVEMENT_TYPE',
  'MOVEMENT_DIRECTION',
];

export interface PhonologySelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface PhonologyValue {
  id: string;
  dimension: PhonologyDimension;
  code: string;
  labelCa: string;
  labelEn?: string | null;
  labelEs?: string | null;
  descriptionCa?: string | null;
  descriptionEn?: string | null;
  descriptionEs?: string | null;
  aliases: string[];
  sortOrder: number;
  active: boolean;
  usageCount?: number;
}

export interface PhonologyValuePayload {
  dimension?: PhonologyDimension;
  code?: string;
  labelCa?: string;
  labelEn?: string;
  labelEs?: string;
  descriptionCa?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  aliases?: string[];
  sortOrder?: number;
  active?: boolean;
}
