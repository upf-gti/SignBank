export interface SearchResult {
  glossId: string;
  gloss: string;
}

export interface RelatedGloss {
  id?: string;
  sourceGlossId?: string;
  targetGlossId?: string;
  relationType: RelationType;
  sourceGloss?: SearchResult;
  targetGloss?: SearchResult;
}

export interface MinimalPair {
  id?: string;
  sourceGlossId?: string;
  targetGlossId?: string;
  distinction: string;
  sourceGloss?: {
    gloss: string;
  };
  targetGloss: {
    gloss: string;
  };
}

export enum RelationType {
  SYNONYM = 'SYNONYM',
  ANTONYM = 'ANTONYM',
  HOMONYM = 'HOMONYM',
  VARIANT = 'VARIANT',
  ASSOCIATED_CONCEPT = 'ASSOCIATED_CONCEPT'
}

export interface GlossRelationship {
  type: RelationType;
  gloss: SearchResult;
} 