import type { RelatedGloss, MinimalPair } from "./gloss"
import { 
  Hand,
  HandConfiguration,
  ConfigurationChange,
  RelationBetweenArticulators,
  MovementRelatedOrientation,
  OrientationRelatedToLocation,
  OrientationChange,
  ContactType,
  MovementType,
  Location,
} from './enums';

export type WordStatus = 'PUBLISHED' | 'DRAFT' | 'PENDING';

export interface Translation {
  id?: string;
  translation: string;
  language: string;
  definitionId: string;
}

export interface ExampleTranslation {
  id?: string;
  translation: string;
  language: string;
  exampleId: string;
  isNew?: boolean;
}

export interface SenseTranslation {
  id?: string;
  translation: string;
  language: string;
  senseId: string;
  isNew?: boolean;
}

export interface Example {
  id?: string;
  example: string;
  exampleVideoURL: string;
  senseId: string;
  exampleTranslations: ExampleTranslation[];
  isNew?: boolean;
}

export interface VideoDefinition {
  id?: string;
  url: string;
}

export interface Definition {
  id?: string;
  title: string;
  definition: string;
  videoDefinitionId: string;
  senseId: string;
  definitionTranslations: Translation[];
  videoDefinition: VideoDefinition;
  isNew?: boolean;
  isEditing?: boolean;
}

export interface Video {
  id?: string;
  url: string;
  angle: string;
  priority: number;
}

export interface PhonologyData {
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
  vocalization: string | '';
  nonManualComponent: string | '';
  inicialization: string | '';
  id?: string;
}

export interface MinimalPairGlossData {
  id?: string;
  gloss: string;
  createdAt: string;
  updatedAt: string;
  editComment: string | null;
  currentVersion: number;
  isCreatedFromRequest: boolean;
  isCreatedFromEdit: boolean;
  senses: {
    id?: string;
    senseTitle: string;
    priority: number;
    lexicalCategory: string;
    glossDataId: string;
    signVideos: {
      id?: string;
      title: string;
      url: string;
      priority: number;
      videoDataId: string;
      senseId: string;
    }[];
  }[];
}

export interface RelatedGlossData {
  id?: string;
  gloss: string;
  createdAt: string;
  updatedAt: string;
  editComment: string | null;
  currentVersion: number;
  isCreatedFromRequest: boolean;
  isCreatedFromEdit: boolean;
  senses: {
    id?: string;
    senseTitle: string;
    priority: number;
    lexicalCategory: string;
    glossDataId: string;
    signVideos: {
      id?: string;
      title: string;
      url: string;
      priority: number;
      videoDataId: string;
      senseId: string;
    }[];
  }[];
}

export interface SignVideo {
  id?: string;
  title: string;
  priority: number;
  videoDataId: string;
  senseId: string;
  videos: Video[];
  minimalPairs: MinimalPair[];
  videoData: PhonologyData;
  isNew?: boolean;
}

export interface Sense {
  id?: string;
  senseTitle: string;
  priority: number;
  lexicalCategory: string;
  glossDataId: string;
  definitions: Definition[];
  signVideos: SignVideo[];
  examples: Example[];
  senseTranslations: SenseTranslation[];
}

export interface GlossData {
  id?: string;
  gloss: string;
  createdAt: string;
  updatedAt: string;
  editComment: string | null;
  currentVersion: number;
  isCreatedFromRequest: boolean;
  isCreatedFromEdit: boolean;
  senses: Sense[];
  relationsAsSource: RelatedGloss[];
  relationsAsTarget: RelatedGloss[];
  minimalPairsAsSource: MinimalPair[];
  minimalPairsAsTarget: MinimalPair[];
  glossRequest: string | null;
}

export interface dictionaryEntry {
  id?: string;
  createdAt: string;
  updatedAt: string;
  status: WordStatus;
  editComment: string | null;
  currentVersion: number;
  isCreatedFromRequest: boolean;
  isCreatedFromEdit: boolean;
  glossRequestId: string | null;
  glossId: string;
  glossData: GlossData;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface GlossRequest {
  id: string;
  creatorId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  denyReason: string | null;
  acceptedById: string | null;
  deniedById: string | null;
  requestedGlossDataId: string;
  glossId: string | null;
  creator: User;
  acceptedBy: User | null;
  deniedBy: User | null;
  requestedGlossData: GlossData;
}

// Enums
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

export enum RequestStatus {
  NOT_COMPLETED = 'NOT_COMPLETED',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED'
}