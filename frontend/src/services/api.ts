import type { AxiosResponse } from "axios"
import { apiClient } from "src/boot/axios"
import type { GlossRequest } from 'src/types/models'

// Create API service object
export const api = {
  glosses: {
    get(id: string): Promise<AxiosResponse<any>> {
      return apiClient.get(`/glosses/${id}`)
    },
    search(query: string): Promise<AxiosResponse<any>> {
      return apiClient.get(`/glosses/search`, { params: { q: query } })
    },
    addRelation(glossId: string, relation: { relationType: string, relatedGlossId: string }): Promise<AxiosResponse<any>> {
      return apiClient.post(`/glosses/${glossId}/relations`, relation)
    },
    removeRelation(glossId: string, relationId: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/glosses/${glossId}/relations/${relationId}`)
    },
    addMinimalPair(glossId: string, pair: { distinction: string, signVideoId: string, minimalPairGlossDataId: string }): Promise<AxiosResponse<any>> {
      return apiClient.post(`/glosses/${glossId}/minimal-pairs`, pair)
    },
    removeMinimalPair(glossId: string, pairId: string): Promise<AxiosResponse<any>> {
      return apiClient.delete(`/glosses/${glossId}/minimal-pairs/${pairId}`)
    }
  },
  requests: {
    getAll(): Promise<AxiosResponse<GlossRequest[]>> {
      return apiClient.get('/gloss-requests/my-requests')
    },
    create(request: Partial<GlossRequest>): Promise<AxiosResponse<GlossRequest>> {
      return apiClient.post('/gloss-requests', request)
    },
  },
  login(credentials: { email: string, password: string }) {
    return apiClient.post('/auth/login', credentials)
  },
  register(credentials: { username: string, email: string, password: string }) {
    return apiClient.post('/auth/register', credentials)
  },
  refreshToken() {
    return apiClient.post('/auth/refresh')
  },
  videos: {
    upload(file: File): Promise<AxiosResponse<{ url: string }>> {
      const formData = new FormData()
      formData.append('video', file)
      return apiClient.post('/videos/upload', formData)
    },
    search(query: string): Promise<AxiosResponse<any>> {
      return apiClient.get(`/videos/search`, { params: { q: query } })
    }
  }
}

export default api