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

export interface SearchResultItem {
  document: Record<string, any>;
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