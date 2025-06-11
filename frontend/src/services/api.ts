import type { AxiosResponse } from "axios"
import { apiClient } from "src/boot/axios"
import type { GlossRequest, GlossData, Language, SignVideo } from 'src/types/models'
import type { SearchParams } from "./search.service"
import type {
  CreateGlossRequestDto,
  GlossRequestResponse,
  GlossRequestDetailResponse,
  UpdateSenseDto,
} from 'src/types/api'

// Create API service object
export const api = {
  glosses: {
    get(id: string): Promise<AxiosResponse<any>> {
      return apiClient.get(`/glosses/${id}`)
    }
  },
  glossData: {
    get(id: string): Promise<AxiosResponse<any>> {
      return apiClient.get(`/gloss-data/${id}`)
    },
    editGloss: (glossDataId: string, data: GlossData) =>
      apiClient.patch<GlossData>(`/gloss-data/${glossDataId}`, data),
  },
  // Senses endpoints
  senses: {
    create: (glossDataId: string, data: { senseTitle: string, lexicalCategory: string }) =>
      apiClient.post<GlossData>(`/senses/${glossDataId}`, data),

    update: (glossDataId: string, senseId: string, data: UpdateSenseDto) =>
      apiClient.put<GlossData>(`/senses/${glossDataId}/${senseId}`, data),

    reorder: (glossDataId: string, data: { senseId: string, newPriority: number }) =>
      apiClient.put<GlossData>(`/senses/${glossDataId}/reorder`, data),

    delete: (glossDataId: string, senseId: string) =>
      apiClient.delete<GlossData>(`/senses/${glossDataId}/${senseId}`),
  },
  // Examples endpoints
  examples: {
    create: (senseId: string, data: { example: string, exampleVideoURL: string }) =>
      apiClient.post<GlossData>(`/examples/sense/${senseId}`, data),

    update: (id: string, data: { example: string, exampleVideoURL: string }) =>
      apiClient.put<GlossData>(`/examples/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<GlossData>(`/examples/${id}`),
  },
  // Translations endpoints
  translations: {
    // Sense translations
    createSenseTranslation: (senseId: string, data: { translation: string, language: Language }) =>
      apiClient.post<GlossData>(`/translations/sense/${senseId}`, data),

    updateSenseTranslation: (id: string, data: { translation: string, language: Language }) =>
      apiClient.put<GlossData>(`/translations/sense/${id}`, data),

    deleteSenseTranslation: (id: string) =>
      apiClient.delete<GlossData>(`/translations/sense/${id}`),
  },
  // Example translations endpoints
  exampleTranslations: {
    // Example translations
    createExampleTranslation: (exampleId: string, data: { translation: string, language: Language }) =>
      apiClient.post<GlossData>(`/example-translations/${exampleId}`, data),

    updateExampleTranslation: (id: string, data: { translation: string, language: Language }) =>
      apiClient.put<GlossData>(`/example-translations/${id}`, data),

    deleteExampleTranslation: (id: string) =>
      apiClient.delete<GlossData>(`/example-translations/${id}`),
  },
  signVideos: {
    create: (data: SignVideo): Promise<AxiosResponse<GlossData>> => {
      return apiClient.post('/sign-videos', data);
    },

    update: (id: string, data: SignVideo): Promise<AxiosResponse<GlossData>> => {
      return apiClient.put(`/sign-videos/${id}`, data);
    },

    delete: (id: string): Promise<AxiosResponse<GlossData>> => {
      return apiClient.delete(`/sign-videos/${id}`);
    }
  },
  videos: {
    upload: (file: File, type: 'gloss' | 'example' = 'gloss'): Promise<AxiosResponse<{ url: string }>> => {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('type', type);
      return apiClient.post('/videos/upload', formData);
    },
    delete: (videoUrl: string): Promise<AxiosResponse<void>> => {
      return apiClient.delete(`/videos/${encodeURIComponent(videoUrl)}`);
    },
    search(query: string): Promise<AxiosResponse<any>> {
      return apiClient.get(`/videos/search`, { params: { q: query } })
    }
  },
  search: {
    search(params: SearchParams): Promise<AxiosResponse<any>> {
      return apiClient.get(`/search`, { params })
    }
  },
  // Auth endpoints
  auth: {
    login: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data),
    register: (data: { email: string; password: string; username: string }) =>
      apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
    refresh: (data: { refresh_token: string }) =>
      apiClient.post('/auth/refresh', data),
  },
  // Gloss requests endpoints
  glossRequests: {
    // Create initial gloss request with just the name
    create: (data: CreateGlossRequestDto) => 
      apiClient.post<GlossRequestResponse>('/gloss-requests', data),
    
    // Get all requests for the current user
    getMine: () => 
      apiClient.get<GlossRequest[]>('/gloss-requests/my-requests'),
    
    // Get a specific request by ID
    get: (id: string) => 
      apiClient.get<GlossRequestDetailResponse>(`/gloss-requests/${id}`),
    
    // Get all pending requests (admin only)
    getPending: () => 
      apiClient.get<GlossRequest[]>('/gloss-requests/pending'),
    
    // Submit the request for approval
    submit: (requestId: string) =>
      apiClient.post<GlossRequestResponse>(`/gloss-requests/${requestId}/submit`),

    // Admin actions
    accept: (requestId: string) =>
      apiClient.post<GlossRequestResponse>(`/gloss-requests/${requestId}/accept`),
    
    decline: (requestId: string, data: { denyReason: string }) =>
      apiClient.post<GlossRequestResponse>(`/gloss-requests/${requestId}/decline`, data),
    update: (requestId: string, data: GlossRequest) =>
      apiClient.put<GlossRequestResponse>(`/gloss-requests/${requestId}`, data),

  },
  // Definitions endpoints
  definitions: {
    create: (senseId: string, data: { title?: string, definition: string }) =>
      apiClient.post<GlossData>(`/definitions/sense/${senseId}`, data),

    update: (senseId: string, definitionId: string, data: { title?: string, definition?: string }) =>
      apiClient.put<GlossData>(`/definitions/sense/${senseId}/${definitionId}`, data),

    delete: (senseId: string, definitionId: string) =>
      apiClient.delete<GlossData>(`/definitions/sense/${senseId}/${definitionId}`),

    updateTranslation: (definitionId: string, translationId: string, data: { translation: string, language: Language }) =>
      apiClient.put<GlossData>(`/definitions/${definitionId}/translations/${translationId}`, data),
  },
  // Relations endpoints
  relations: {
    create: (glossId: string, data: { targetGlossId: string, relationType: string }) =>
      apiClient.post<GlossData>(`/relations/gloss/${glossId}`, data),

    update: (relationId: string, data: { relationType: string }) =>
      apiClient.patch<GlossData>(`/relations/${relationId}`, data),

    delete: (relationId: string) =>
      apiClient.delete<GlossData>(`/relations/${relationId}`),
  },
  // Minimal pairs endpoints
  minimalPairs: {
    create: (glossId: string, data: { targetGlossId: string, distinction: string }) =>
      apiClient.post<GlossData>(`/minimal-pairs/gloss/${glossId}`, data),

    update: (pairId: string, data: { distinction: string }) =>
      apiClient.patch<GlossData>(`/minimal-pairs/${pairId}`, data),

    delete: (pairId: string) =>
      apiClient.delete<GlossData>(`/minimal-pairs/${pairId}`),
  },
  // SignVideo priority endpoints
  signVideoPriority: {
    update: (signVideoId: string, data: { priority: number }) =>
      apiClient.patch<GlossData>(`/gloss-data/sign-videos/${signVideoId}/priority`, data),

    reorder: (senseId: string, data: { signVideoIds: string[] }) =>
      apiClient.post<GlossData>(`/gloss-data/senses/${senseId}/sign-videos/reorder`, data),
  },
  // Video priority endpoints  
  videoPriority: {
    update: (videoId: string, data: { priority: number }) =>
      apiClient.patch<GlossData>(`/gloss-data/videos/${videoId}/priority`, data),

    reorder: (signVideoId: string, data: { videoIds: string[] }) =>
      apiClient.post<GlossData>(`/gloss-data/sign-videos/${signVideoId}/videos/reorder`, data),
  },
}

export default api