import type { GlossData , Language, RequestStatus, Hand } from './models'

export type WordStatus = 'PUBLISHED' | 'DRAFT' | 'PENDING';

export interface Translation {
  id: string;
  translation: string;
  language: string;
}

export interface Example {
  id: string;
  example: string;
  exampleVideoURL: string;
}

export interface VideoDefinition {
  id: string;
  url: string;
}

export interface Definition {
  id: string;
  title: string;
  definition: string;
  translations: Translation[];
  examples: Example[];
  videoDefinition: VideoDefinition;
}

export interface Video {
  id: string;
  url: string;
  angle: string;
  priority: number;
}

export interface SignVideo {
  id: string;
  title: string;
  url: string;
  priority: number;
  senseId: string;
  videos: Video[];
  minimalPairs: any[]; // You might want to define a specific type for minimal pairs
}

export interface Sense {
  id: string;
  senseTitle: string;
  priority: number;
  lexicalCategory: string;
  definitions: Definition[];
}

export interface RelatedGloss {
  id: string;
  sourceGlossId: string;
  targetGlossId: string;
  relationType: string;
}

export interface Gloss {
  id: string;
  gloss: string;
  createdAt: string;
  updatedAt: string;
  editComment: string | null;
  currentVersion: number;
  isCreatedFromRequest: boolean;
  isCreatedFromEdit: boolean;
  sense: Sense;
  RelatedGloss: RelatedGloss[];
  glossVideos: SignVideo[];
}

// Request DTOs
export interface CreateGlossRequestDto {
  gloss: string;
}

export interface UpdateDefinitionDto {
  title?: string;
  definition: string;
  videoDefinitionId?: string;
}

export interface UpdateExampleDto {
  example: string;
  exampleVideoURL: string;
}

export interface UpdateVideoDto {
  title: string;
  url: string;
  priority?: number;
  videoData: {
    hands: Hand;
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
    repeatedMovement: boolean;
    movementDirection: string;
  };
}

export interface UpdateTranslationDto {
  translation: string;
  language: Language;
}

export interface UpdateSenseDto {
  senseTitle: string;
  lexicalCategory: string;
  priority?: number;
}

// Response DTOs
export interface GlossRequestResponse {
  id: string;
  gloss: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    username: string;
  };
  lastEditedSection?: string;
}

export interface GlossRequestDetailResponse extends GlossRequestResponse {
  requestedGlossData: GlossData;
  acceptedBy?: {
    id: string;
    username: string;
  };
  deniedBy?: {
    id: string;
    username: string;
  };
  denyReason?: string;
  definitions: Array<{
    id: string;
    title?: string;
    definition: string;
    videoDefinition: {
      id: string;
      url: string;
    };
    translations: Array<{
      id: string;
      translation: string;
      language: Language;
    }>;
  }>;
  examples: Array<{
    id: string;
    example: string;
    exampleVideoURL: string;
    translations: Array<{
      id: string;
      translation: string;
      language: Language;
    }>;
  }>;
  videos: Array<{
    id: string;
    title: string;
    url: string;
    priority: number;
    videoData: {
      hands: Hand;
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
      repeatedMovement: boolean;
      movementDirection: string;
    };
  }>;
  translations: Array<{
    id: string;
    translation: string;
    language: Language;
  }>;
}

