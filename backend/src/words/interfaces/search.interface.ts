export interface SearchOptions {
  query: string;
  limit: number;
  queryBy: string[];
  filterBy: Record<string, any>;
  sortBy: string;
  page: number;
  facetBy: string[];
}

export interface SearchHighlight {
  field: string;
  matched_tokens: string[] | string[][];
  snippet?: string;
  value?: string;
  snippets?: string[];
  indices?: number[];
}

// Simple word data returned in search results
export interface WordSummary {
  id: number;
  word: string;
  definition: string;
  videoUrls: string[];
}

export interface SearchResultItem {
  word: WordSummary;
  highlights: SearchHighlight[];
  textMatch: number;
}

export interface SearchResult {
  found: number;
  page: number;
  hits: SearchResultItem[];
  facets?: Record<string, any>[];
}

export interface FacetResult {
  counts: Array<{
    count: number;
    value: string;
  }>;
} 