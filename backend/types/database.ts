/**
 * Types representing the database schema
 * Generated from schema.prisma
 */

// Enum types
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED'
}

export enum Language {
  CATALAN = 'CATALAN',
  SPANISH = 'SPANISH',
  ENGLISH = 'ENGLISH',
  OTHER = 'OTHER'
}

export enum LexicalCategory {
  NOUN = 'NOUN',
  VERB = 'VERB',
  ADJECTIVE = 'ADJECTIVE',
  ADVERB = 'ADVERB',
  PRONOUN = 'PRONOUN',
  DETERMINER = 'DETERMINER',
  PREPOSITION = 'PREPOSITION',
  CONJUNCTION = 'CONJUNCTION',
  INTERJECTION = 'INTERJECTION',
  OTHER = 'OTHER'
}

export enum RelationType {
  SYNONYM = 'SYNONYM',
  REGIONAL_VARIANT = 'REGIONAL_VARIANT',
  ASSOCIATED_CONCEPT = 'ASSOCIATED_CONCEPT',
  ANTONYM = 'ANTONYM',
  HYPERNYM = 'HYPERNYM',
  HYPONYM = 'HYPONYM'
}

export enum Hand {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
  BOTH = 'BOTH'
}

export enum GlossStatus {
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum EditStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type DictionaryEntry = {
  createdAt: Date;
  updatedAt: Date;
  status: GlossStatus;
  editComment?: string;
  currentVersion: number;
  isCreatedFromRequest: boolean;
  isCreatedFromEdit: boolean;
  glossRequestId?: string;
  gloss: Gloss;
}

export type RelatedGlosses = {
  glossId: string;
  relationType: RelationType;
}

export type Gloss = {
  createdAt: Date;
  updatedAt: Date;
  editComment?: string;
  currentVersion: number;
  isCreatedFromRequest: boolean;
  isCreatedFromEdit: boolean;
  relatedGlosses: RelatedGlosses[];
  sense: Sense;

}
export type Sense = {
  senseTitle: string;
  priority: number;
  definitions: Definition[];
  lexicalCategory?: LexicalCategory;
  signVideos: SignVideo[];
};

export type Definition = {
  title?: string;
  definition: string;
  examples: string[];
  translations: DefinitionTranslation[]; // Embedded translations
  videoDefinition: VideoDefinition;
};

export type VideoDefinition = {
  url: string;
}

export type DefinitionTranslation = {
  translation: string;
  language: Language;
};


export type SignVideo = {
  title: string
  videos: Video[];
  url: string;
  priority: number;
  videoData: {
    hands: Hand
    configuration: string
    configurationChanges: string
    relationBetweenArticulators: string
    location: string
    movementRelatedOrientation: string
    locationRelatedOrientation: string
    orientationChange: string
    contactType: string
    movementType: string
    vocalization: string
    nonManualComponent: string
    inicialization: string
  }
  minimalPairs: MinimalPair[]
};

export type MinimalPair = {
  glossId: string,
  distinction: string
}
export type Video = {
  url: string;
  angle: string;
  priority: number;
}

export type User = {
  username: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  accessToken: string;
  refreshToken: string;
};

export type GlossRequest = {
  creatorId: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  denyReason?: string;
  acceptedById?: string;
  deniedById?: string;
  requestedGlossData: Gloss;
  glossId?: string;
}; 

// export type GlossEdit = {
//   glossId: string;
//   editorId: string;
//   comment?: string;
//   status: EditStatus;
//   denyReason?: string;
//   newGlossVersionId?: string;
//   createdAt: Date;
//   updatedAt: Date;
//   currentGlossData?: Gloss;
//   proposedGlossData?: Gloss;
//   proposedChanges?: any; // Represented as Json in the schema
// };

// export type WordEditHistoric = {
//   id: string;
//   originalWordId: string;
//   archivedAt: Date;
//   wordData: any; // Represented as Json in the schema
//   versionNumber: number;
// };
