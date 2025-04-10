export interface WordEntry {
  id: string
  createdAt: Date
  updatedAt: Date
  creatorId: string
  status: WordStatus
  editorId?: string
  editComment?: string
  currentVersion: number
  originatedFromRequestId?: string
  dialectId?: string
  dialect?: Dialect
  isCreatedFromRequest: boolean
  isCreatedFromEdit: boolean
  acceptedById?: string
  wordRequestId?: string
  
  // Word data as embedded type
  wordData: Word
}

// Define Word type to match the Prisma Word embedded type
export interface Word {
  word: string
  isNative: boolean
  senses: Sense[]
  relatedWords: RelatedWord[]
  dialectId?: string
}

export interface Sense {
  priority: number
  usageEra?: string
  usageFrequency?: string
  descriptions: Description[]
  videos?: Video[]
  lexicalCategory?: LexicalCategory
  morphologicalVariants?: string
}

export interface Description {
  description: string
  examples: string[]
  translations: SenseTranslation[]
}

export interface SenseTranslation {
  translation: string
  language: Language
}

export interface Video {
  url: string
  angle: string
  priority: number
  dominantHand?: Hand
  facialExpression?: string
  hasContact?: boolean
  movementType?: string
  nonManualComponents?: string
  phonologicalTranscription?: string
}

export interface RelatedWord {
  wordId: string
  relationType: RelationType
}

export interface Dialect {
  id: string
  name: string
  region: string
  mapCoordinates?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// Add WordRequest interface to match backend schema
export interface WordRequest {
  id: string
  creatorId: string
  activeWordId?: string
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
  denyReason?: string
  acceptedById?: string
  denyerId?: string
  
  // Word data using the Word type
  requestedWordData: Word
  
  // Relations
  wordEntry?: WordEntry
}

// Enum types
export enum WordStatus {
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  EDIT_REQUEST = 'EDIT_REQUEST',
  REJECTED = 'REJECTED'
}

export enum EditStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
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

export interface WordEdit {
  id: string
  wordId: string
  editorId: string
  comment?: string
  status: EditStatus
  denyReason?: string
  newWordVersionId?: string
  createdAt: Date
  updatedAt: Date
  
  // Proposed changes using the Word type
  currentWordData?: Word
  proposedWordData?: Word
  proposedChanges?: any
}