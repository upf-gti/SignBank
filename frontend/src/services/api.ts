import type { AxiosResponse } from "axios"
import { apiClient } from "src/boot/axios"
import type { SearchResponse } from "src/types/word"

// Create API service object
export const api = {
  login(credentials: { email: string, password: string }) {
    return apiClient.post('/auth/login', credentials)
  },
  wordRequests: {
    get() {
      return apiClient.get('/word-requests')
    },
    getPending() {
      return apiClient.get('/word-requests/pending')
    },
    post(dto: { word: string, description: string, videoUrl: string }) {
      return apiClient.post('/word-requests', dto)
    },
    updateRequestStatus(id: number, dto: { status: string, denyReason?: string }) {
      return apiClient.patch(`/word-requests/${id}`, dto)
    }
  },
  words: {
    search(query: string, limit: number = 100, filters?: Record<string, any>): Promise<AxiosResponse<SearchResponse>> {
      return apiClient.get('/words/search', { params: { q: query, limit, ...filters } })
    }
  }
}

export default api