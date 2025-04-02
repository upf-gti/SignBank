export interface Words {
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
  // Fields from wordData embedded type (previously direct properties)
  word: string
  isNative: boolean
  register?: string
  senses: Sense[]
  relatedWords?: RelatedWord[]
  dominantHand?: Hand
  facialExpression?: string
  hasContact?: boolean
  lexicalCategory?: LexicalCategory
}

// Define Word type to match the Prisma Word embedded type
export interface Word {
  word: string
  isNative: boolean
  register?: string
  senses: Sense[]
  relatedWords: RelatedWord[]
  dominantHand?: Hand
  facialExpression?: string
  hasContact?: boolean
  lexicalCategory?: LexicalCategory
}

export interface Sense {
  priority: number
  dominantHand?: Hand
  facialExpression?: string
  hasContact?: boolean
  descriptions: Description[]
  morphologicalVariants?: string
  movementType?: string
  nonManualComponents?: string
  phonologicalTranscription?: string
  usageEra?: string
  usageFrequency?: string
  videos?: VideoInfo[]
}

export interface Description {
  text: string
  examples: string[]
  translations: SenseTranslation[]
}

export interface SenseTranslation {
  text: string
  language: Language
}

export interface VideoInfo {
  url: string
  angle: string
  priority: number
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
  userId: string
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
  denyReason?: string
  dialectId?: string
  requestedWordData: Word
  createdWordId?: string
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
  currentWordData?: Word
  proposedWordData?: Word
  proposedChanges?: any
}