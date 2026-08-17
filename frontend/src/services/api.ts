import type { AxiosResponse } from "axios"
import { apiClient } from "src/boot/axios"
import type { GlossRequest, GlossData, Language, SignVideo } from 'src/types/models'
import type { SearchParams } from "./search.service"
import type {
  CreateGlossRequestDto,
  GlossRequestResponse,
  GlossRequestDetailResponse,
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
    updateGloss: (glossDataId: string, data: { gloss: string }) =>
      apiClient.patch<GlossData>(`/gloss-data/${glossDataId}/gloss`, data),
    archiveGloss: (glossDataId: string) =>
      apiClient.patch<GlossData>(`/gloss-data/${glossDataId}/archive`),
    unarchiveGloss: (glossDataId: string) =>
      apiClient.patch<GlossData>(`/gloss-data/${glossDataId}/unarchive`),
  },
  compound: {
    update: (glossDataId: string, data: Record<string, unknown>) =>
      apiClient.put<GlossData>(`/gloss-data/${glossDataId}/compound`, data),
  },
  examples: {
    create: (glossDataId: string, data: { example: string, exampleVideoURL: string }) =>
      apiClient.post<GlossData>(`/examples/gloss/${glossDataId}`, data),

    update: (id: string, data: { example: string, exampleVideoURL: string }) =>
      apiClient.put<GlossData>(`/examples/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<GlossData>(`/examples/${id}`),

    deleteVideo: (id: string) =>
      apiClient.delete<GlossData>(`/examples/${id}/video`),
  },
  // Translations endpoints
  translations: {
    createGlossTranslation: (glossDataId: string, data: { translation: string, language: Language }) =>
      apiClient.post<GlossData>(`/translations/gloss/${glossDataId}`, data),

    updateGlossTranslation: (id: string, data: { translation: string, language: Language }) =>
      apiClient.put<GlossData>(`/translations/${id}`, data),

    deleteGlossTranslation: (id: string) =>
      apiClient.delete<GlossData>(`/translations/${id}`),
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
    upload: (file: File, type: 'gloss' | 'example' | 'definition' = 'gloss'): Promise<AxiosResponse<{ url: string }>> => {
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
    verify: () => apiClient.get('/auth/verify'),
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
    create: (glossDataId: string, data: { title?: string, definition: string, lexicalCategory?: string, videoDefinitionUrl?: string, priority?: number }) =>
      apiClient.post<GlossData>(`/definitions/gloss/${glossDataId}`, data),

    update: (glossDataId: string, definitionId: string, data: { title?: string, definition?: string, lexicalCategory?: string, videoDefinitionUrl?: string, priority?: number }) =>
      apiClient.put<GlossData>(`/definitions/gloss/${glossDataId}/${definitionId}`, data),

    delete: (glossDataId: string, definitionId: string) =>
      apiClient.delete<GlossData>(`/definitions/gloss/${glossDataId}/${definitionId}`),

    deleteVideo: (glossDataId: string, definitionId: string) =>
      apiClient.delete<GlossData>(`/definitions/gloss/${glossDataId}/${definitionId}/video`),

    createTranslation: (definitionId: string, data: { translation: string, language: Language }) =>
      apiClient.post<GlossData>(`/definitions/${definitionId}/translations`, data),

    updateTranslation: (definitionId: string, translationId: string, data: { translation: string, language: Language }) =>
      apiClient.put<GlossData>(`/definitions/${definitionId}/translations/${translationId}`, data),

    deleteTranslation: (definitionId: string, translationId: string) =>
      apiClient.delete<GlossData>(`/definitions/${definitionId}/translations/${translationId}`),
  },
  // Relations endpoints
  relations: {
    create: (glossId: string, data: { targetGlossId: string, relationType: string }) =>
      apiClient.post<GlossData>(`/gloss-data/${glossId}/relations`, data),

    update: (relationId: string, data: { relationType: string }) =>
      apiClient.patch<GlossData>(`/gloss-data/relations/${relationId}`, data),

    delete: (relationId: string) =>
      apiClient.delete<GlossData>(`/gloss-data/relations/${relationId}`),
  },
  // Minimal pairs endpoints
  minimalPairs: {
    create: (glossId: string, data: { targetGlossId: string, distinction: string }) =>
      apiClient.post<GlossData>(`/gloss-data/${glossId}/minimal-pairs`, data),

    update: (pairId: string, data: { distinction: string }) =>
      apiClient.patch<GlossData>(`/gloss-data/minimal-pairs/${pairId}`, data),

    delete: (pairId: string) =>
      apiClient.delete<GlossData>(`/gloss-data/minimal-pairs/${pairId}`),
  },
  // SignVideo priority endpoints
  signVideoPriority: {
    update: (signVideoId: string, data: { priority: number }) =>
      apiClient.patch<GlossData>(`/gloss-data/sign-videos/${signVideoId}/priority`, data),

    reorder: (glossDataId: string, data: { signVideoIds: string[] }) =>
      apiClient.post<GlossData>(`/gloss-data/${glossDataId}/sign-videos/reorder`, data),
  },
  // Video priority endpoints  
  videoPriority: {
    update: (videoId: string, data: { priority: number }) =>
      apiClient.patch<GlossData>(`/gloss-data/videos/${videoId}/priority`, data),

    reorder: (signVideoId: string, data: { videoIds: string[] }) =>
      apiClient.post<GlossData>(`/gloss-data/sign-videos/${signVideoId}/videos/reorder`, data),
  },
  // Users endpoints (admin only)
  users: {
    getAll: () => apiClient.get('/users'),
    updateRole: (userId: string, role: 'ADMIN' | 'USER') =>
      apiClient.put(`/users/${userId}/role`, { role }),
    delete: (userId: string) => apiClient.delete(`/users/${userId}`),
    changePassword: (userId: string, newPassword: string) =>
      apiClient.put(`/users/${userId}/password`, { newPassword }),
  },
  bulkImport: {
    importFitxas: (files: File[], overwriteAll: boolean, overwriteGlosses: string[] = []) => {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      formData.append('overwriteAll', String(overwriteAll))
      formData.append('overwriteGlosses', JSON.stringify(overwriteGlosses))
      return apiClient.post('/bulk-import', formData, {
        timeout: 10 * 60 * 1000,
      })
    },
  },
}

export default api