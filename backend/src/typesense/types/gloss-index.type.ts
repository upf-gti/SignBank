import { LexicalCategory } from '@prisma/client';

/** One Typesense document per published gloss (document id = glossData.id). */
export interface GlossIndex {
  id: string;
  glossId: string;
  gloss: string;
  url: string;
  signVideoTitle: string;
  isCompound?: boolean;
  lexicalCategory: LexicalCategory | string;
  lexicalCategories: (LexicalCategory | string)[];
  description: string;
  handedness: string;
  dominantConfiguration: string;
  nonDominantConfiguration: string;
  dominantRelationBetweenArticulators: string;
  nonDominantRelationBetweenArticulators: string;
  configurationChanges: string;
  location: string;
  movementRelatedOrientation: string;
  orientationRelatedToLocation: string;
  orientationChange: string;
  contactType: string;
  movementType: string;
  movementDirection: string;
  repeatedMovement: boolean;
  vocalization: string;
  nonManualComponent: string;
  inicialization: string;
}

/** @deprecated Use GlossIndex */
export type VideoIndex = GlossIndex;

export const GLOSS_SEARCH_SYNC_EVENT = 'gloss.search.sync';

export interface GlossSearchSyncPayload {
  glossDataId: string;
}
