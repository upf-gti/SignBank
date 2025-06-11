import translate from 'src/utils/translate'
import { api } from './api';

export interface SearchParams {
  query: string;
  page?: number | undefined;
  limit?: number | undefined;
  facet_by?: string | undefined;
  filter_by?: string | undefined;
}

export interface SearchResult {
  id: string;
  url: string | null;
  signVideoTitle: string | null;
  hands: string | null;
  configuration: string | null;
  configurationChanges: string | null;
  relationBetweenArticulators: string | null;
  location: string | null;
  movementRelatedOrientation: string | null;
  locationRelatedOrientation: string | null;
  orientationChange: string | null;
  contactType: string | null;
  movementType: string | null;
  vocalization: string | null;
  nonManualComponent: string | null;
  inicialization: string | null;
  senseId: string;
  senseTitle: string;
  lexicalCategory: string;
  glossId: string;
  gloss: string;
}

export interface SearchResponse {
  found: number;
  hits: Array<{
    document: SearchResult;
    highlights: Array<{
      field: string;
      snippet: string;
    }>;
  }>;
  page: number;
  facet_counts?: Array<{
    field_name: string;
    counts: Array<{
      value: string;
      count: number;
    }>;
  }>;
}

class SearchService {
  async search(params: SearchParams): Promise<SearchResponse> {
    const { data } = await api.search.search(params);
    return data;
  }

  getFacetFields() {
    return [
      { field: 'lexicalCategory', label: translate('lexicalCategory') },
      { field: 'hands', label: translate('hands') },
      { field: 'configuration', label: translate('configuration') },
      { field: 'configurationChanges', label: translate('configurationChanges') },
      { field: 'relationBetweenArticulators', label: translate('relationBetweenArticulators') },
      { field: 'location', label: translate('location') },
      { field: 'movementRelatedOrientation', label: translate('movementRelatedOrientation') },
      { field: 'locationRelatedOrientation', label: translate('locationRelatedOrientation') },
      { field: 'orientationChange', label: translate('orientationChange') },
      { field: 'contactType', label: translate('contactType') },
      { field: 'movementType', label: translate('movementType') },
      { field: 'vocalization', label: translate('vocalization') },
      { field: 'nonManualComponent', label: translate('nonManualComponent') },
      { field: 'inicialization', label: translate('inicialization') }
    ];
  }
}

export const searchService = new SearchService(); 