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

export enum WordStatus {
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum EditStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Embedded types
export type SenseTranslation = {
  translation: string;
  language: Language;
};

export type Description = {
  description: string;
  examples: string[];
  translations: SenseTranslation[]; // Embedded translations
};

export type Video = {
  id: string;
  url: string;
  angle: string;
  priority: number;
  dominantHand?: Hand;
  facialExpression?: string;
  hasContact?: boolean;
  phonologicalTranscription?: string;
  nonManualComponents?: string;
  movementType?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Sense = {
  priority: number;
  morphologicalVariants?: string;
  usageEra?: string;
  usageFrequency?: string;
  descriptions: Description[];
  videoIds: string[]; // For storage/reference
  lexicalCategory?: LexicalCategory;
};

export type RelatedWord = {
  wordId: string;
  relationType: RelationType;
};

export type Word = {
  word: string;
  isNative: boolean;
  senses: Sense[];
  relatedWords: RelatedWord[];
  dialectId?: string;
};

// Model types
export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
};

export type Dialect = {
  id: string;
  name: string;
  region: string;
  mapCoordinates?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WordEntry = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: WordStatus;
  editComment?: string;
  currentVersion: number;
  isCreatedFromRequest: boolean;
  isCreatedFromEdit: boolean;
  wordRequestId?: string;
  wordData: Word;
};

export type WordEdit = {
  id: string;
  wordId: string;
  editorId: string;
  comment?: string;
  status: EditStatus;
  denyReason?: string;
  newWordVersionId?: string;
  createdAt: Date;
  updatedAt: Date;
  currentWordData?: Word;
  proposedWordData?: Word;
  proposedChanges?: any; // Represented as Json in the schema
};

export type WordEditHistoric = {
  id: string;
  originalWordId: string;
  archivedAt: Date;
  wordData: any; // Represented as Json in the schema
  versionNumber: number;
};

export type WordRequest = {
  id: string;
  creatorId: string;
  activeWordId?: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  denyReason?: string;
  acceptedById?: string;
  denyerId?: string;
  requestedWordData: Word;
  wordId?: string;
}; 