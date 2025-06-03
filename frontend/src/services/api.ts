import type { AxiosResponse } from "axios"
import { apiClient } from "src/boot/axios"
import type { GlossRequest, GlossData, Definition, Translation, Language } from 'src/types/models'
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
    deleteSense(id: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/gloss-data/senses/${id}`)
    },
    removeDefinition(id: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/gloss-data/definitions/${id}`)
    },
    editDefinition: (senseId: string, definitionId: string, data: { title: string, definition: string, videoDefinitionId: string }) =>
      apiClient.patch<Definition>(`/gloss-data/senses/${senseId}/definitions/${definitionId}`, data),
    editDefinitionTranslation: (definitionId: string, translationId: string, data: { translation: string, language: string }) =>
      apiClient.patch<Translation>(`/gloss-data/definitions/${definitionId}/translations/${translationId}`, data),
    deleteDefinitionTranslation(id: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/gloss-data/definition-translations/${id}`)
    },
    deleteSignVideo(id: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/gloss-data/sign-videos/${id}`)
    },
    deleteVideo(id: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/gloss-data/videos/${id}`)
    },
    deleteVideoData(id: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/gloss-data/video-data/${id}`)
    },
    deleteSenseTranslation(id: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/gloss-data/sense-translations/${id}`)
    },
    deleteRelatedGloss(id: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/gloss-data/related-glosses/${id}`)
    },
    deleteMinimalPair(id: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/gloss-data/minimal-pairs/${id}`)
    },
    // Sense management
    createSense: (glossDataId: string, data: { senseTitle: string, lexicalCategory: string }) =>
      apiClient.post<GlossData>(`/gloss-data/${glossDataId}/senses`, data),

    editSense: (glossDataId: string, senseId: string, data: UpdateSenseDto) =>
      apiClient.patch<GlossData>(`/gloss-data/${glossDataId}/senses/${senseId}`, data),

    reorderSense: (glossDataId: string, data: { senseId: string, newPriority: number }) =>
      apiClient.patch<GlossData>(`/gloss-data/${glossDataId}/senses/reorder`, data),

    removeSense: (glossDataId: string, senseId: string) =>
      apiClient.delete<GlossData>(`/gloss-data/${glossDataId}/senses/${senseId}`),

    createDefinition: (senseId: string, data: { title: string, definition: string, videoDefinitionId?: string }) =>
      apiClient.post<GlossData>(`/gloss-data/senses/${senseId}/definitions`, data),

    updateDefinition: (senseId: string, definitionId: string, data: { title: string, definition: string, videoDefinitionId?: string }) =>
      apiClient.patch<GlossData>(`/gloss-data/senses/${senseId}/definitions/${definitionId}`, data),

    deleteDefinition: (senseId: string, definitionId: string) =>
      apiClient.delete<GlossData>(`/gloss-data/senses/${senseId}/definitions/${definitionId}`),

    // Sense Translations
    createSenseTranslation: (senseId: string, data: { translation: string, language: string }) =>
      apiClient.post<GlossData>(`/gloss-data/senses/${senseId}/translations`, data),

    updateSenseTranslation: (translationId: string, data: { translation: string, language: string }) =>
      apiClient.patch<GlossData>(`/gloss-data/sense-translations/${translationId}`, data),

    // Examples
    createExample: (senseId: string, data: { example: string, exampleVideoURL: string }) =>
      apiClient.post<GlossData>(`/gloss-data/senses/${senseId}/examples`, data),

    updateExample: (exampleId: string, data: { example: string, exampleVideoURL: string }) =>
      apiClient.patch<GlossData>(`/gloss-data/examples/${exampleId}`, data),

    deleteExample: (id: string) =>
      apiClient.delete<GlossData>(`/gloss-data/examples/${id}`),

    // Example Translations
    createExampleTranslation: (exampleId: string, data: { translation: string, language: Language }) =>
      apiClient.post<GlossData>(`/gloss-data/examples/${exampleId}/translations`, data),

    updateExampleTranslation: (translationId: string, data: { translation: string, language: Language }) =>
      apiClient.patch<GlossData>(`/gloss-data/example-translations/${translationId}`, data),

    deleteExampleTranslation: (id: string) =>
      apiClient.delete<GlossData>(`/gloss-data/example-translations/${id}`),
  },
  requests: {
    getAll(): Promise<AxiosResponse<GlossRequest[]>> {
      return apiClient.get('/gloss-requests/my-requests')
    },
    create(request: Partial<GlossRequest>): Promise<AxiosResponse<GlossRequest>> {
      return apiClient.post('/gloss-requests', request)
    },
    get(id: string): Promise<AxiosResponse<GlossRequest>> {
      return apiClient.get(`/gloss-requests/${id}`)
    },
    getPending(): Promise<AxiosResponse<GlossRequest[]>> {
      return apiClient.get('/gloss-requests/pending')
    },
    update(id: string, request: Partial<GlossRequest>): Promise<AxiosResponse<GlossRequest>> {
      return apiClient.put(`/gloss-requests/${id}`, request)
    },
    accept(id: string, glossData: GlossData): Promise<AxiosResponse<GlossRequest>> {
      return apiClient.post(`/gloss-requests/${id}/accept`, glossData)
    },
    decline({id, reason}: {id: string, reason: string}): Promise<AxiosResponse<GlossRequest>> {
      return apiClient.post(`/gloss-requests/${id}/decline`, { reason })
    }
  },
  login(credentials: { email: string, password: string }) {
    return apiClient.post('/auth/login', credentials)
  },
  register(credentials: { username: string, email: string, password: string }) {
    return apiClient.post('/auth/register', credentials)
  },
  refreshToken(body: { refresh_token: string }) {
    return apiClient.post('/auth/refresh', body)
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
  },
  // Gloss requests endpoints
  glossRequests: {
    // Create initial gloss request with just the name
    create: (data: CreateGlossRequestDto) => 
      apiClient.post<GlossRequestResponse>('/gloss-requests', data),
    
    // Get all requests for the current user
    getMine: () => 
      apiClient.get<GlossRequestResponse[]>('/gloss-requests/my-requests'),
    
    // Get a specific request by ID
    get: (id: string) => 
      apiClient.get<GlossRequestDetailResponse>(`/gloss-requests/${id}`),
    
    // Get all pending requests (admin only)
    getPending: () => 
      apiClient.get<GlossRequestResponse[]>('/gloss-requests/pending'),
    
    // Submit the request for approval
    submit: (requestId: string) =>
      apiClient.post<GlossRequestResponse>(`/gloss-requests/${requestId}/submit`),

    // Admin actions
    accept: (requestId: string) =>
      apiClient.post<GlossRequestResponse>(`/gloss-requests/${requestId}/accept`),
    
    decline: (requestId: string, data: { denyReason: string }) =>
      apiClient.post<GlossRequestResponse>(`/gloss-requests/${requestId}/decline`, data),
  }
}

export default api