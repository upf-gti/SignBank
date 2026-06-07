import {
  Hand,
  HandConfiguration,
  ConfigurationChange,
  RelationBetweenArticulators,
  Location,
  MovementRelatedOrientation,
  OrientationRelatedToLocation,
  OrientationChange,
  ContactType,
  MovementType,
  MovementDirection,
  LexicalCategory,
} from '@prisma/client';

/** One Typesense document per published gloss (document id = glossData.id). */
export interface GlossIndex {
  id: string;
  glossId: string;
  gloss: string;
  url: string;
  signVideoTitle: string;
  senseId: string;
  senseTitle: string;
  lexicalCategory: LexicalCategory | string;
  description: string;
  hands: Hand;
  configuration: HandConfiguration | '';
  configurationChanges: ConfigurationChange | '';
  relationBetweenArticulators: RelationBetweenArticulators | '';
  location: Location | '';
  movementRelatedOrientation: MovementRelatedOrientation | '';
  orientationRelatedToLocation: OrientationRelatedToLocation | '';
  orientationChange: OrientationChange | '';
  contactType: ContactType | '';
  movementType: MovementType | '';
  movementDirection: MovementDirection | '';
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
