export type WordStatus = 'PUBLISHED' | 'DRAFT' | 'PENDING';

export interface Translation {
  id: string;
  translation: string;
  language: string;
  definitionId: string;
}

export interface Example {
  id: string;
  example: string;
  exampleVideoURL: string;
  definitionId: string;
}

export interface VideoDefinition {
  id: string;
  url: string;
}

export interface Definition {
  id: string;
  title: string;
  definition: string;
  videoDefinitionId: string;
  senseId: string;
  translations: Translation[];
  examples: Example[];
  videoDefinition: VideoDefinition;
}

export interface Video {
  id: string;
  url: string;
  angle: string;
  priority: number;
  signVideoId: string;
}

export interface SignVideo {
  id: string;
  title: string;
  url: string;
  priority: number;
  videoDataid: string;
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
  signVideos: SignVideo[];
}

export interface RelatedGloss {
  id: string;
  glossId: string;
  relatedGlossId: string;
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
  senseId: string;
  sense: Sense;
  RelatedGloss: RelatedGloss[];
}

export interface Word {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: WordStatus;
  editComment: string | null;
  currentVersion: number;
  isCreatedFromRequest: boolean;
  isCreatedFromEdit: boolean;
  glossRequestId: string | null;
  glossId: string;
  gloss: Gloss;
}
