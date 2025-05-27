import { Gloss } from "./api"

export type WordStatus = 'PUBLISHED' | 'DRAFT' | 'PENDING';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
}

export interface SenseTranslation {
  id?: string;
  translation: string;
  language: string;
  senseId: string;
}

export interface Example {
  id?: string;
  example: string;
  exampleVideoURL: string;
  senseId: string;
  exampleTranslations: ExampleTranslation[];
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
}

export interface Video {
  id?: string;
  url: string;
  angle: string;
  priority: number;
}

export interface VideoData {
  hands: string;
  configuration: string;
  configurationChanges: string;
  relationBetweenArticulators: string;
  location: string;
  movementRelatedOrientation: string;
  locationRelatedOrientation: string;
  orientationChange: string;
  contactType: string;
  movementType: string;
  vocalization: string;
  nonManualComponent: string;
  inicialization: string;
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

export interface MinimalPair {
  id?: string;
  glossDataId: string;
  distinction: string;
  signVideoId: string;
  minimalPairGlossDataId: string;
  minimalPairGlossData: MinimalPairGlossData;
}

export interface SignVideo {
  id?: string;
  title: string;
  url: string;
  priority: number;
  videoDataId: string;
  senseId: string;
  videos: Video[];
  minimalPairs: MinimalPair[];
  videoData: VideoData;
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

export interface RelatedGloss {
  id?: string;
  glossId: string;
  relatedGlossId: string;
  relationType: string;
  relatedGloss: RelatedGlossData;
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
  relatedGlosses: RelatedGloss[];
  minimalPairs: MinimalPair[];
  glossRequest: string | null; // You might want to define a specific type for glossRequest
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