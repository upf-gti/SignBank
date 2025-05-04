import type { AxiosResponse } from "axios"
import { apiClient } from "src/boot/axios"
import type {  Word } from "src/types/database"
import type { WordRequest } from "src/types/database"
// Create API service object
export const api = {
  login(credentials: { email: string, password: string }) {
    return apiClient.post('/auth/login', credentials)
  },
  wordRequests: {
    get(id?: string): Promise<AxiosResponse<WordRequest | WordRequest[]>> {
      return apiClient.get(`/word-requests${id ? `/${id}` : ''}`)
    },
    getPending() : Promise<AxiosResponse<WordRequest[]>> {
      return apiClient.get('/word-requests/pending')
    },
    post(dto: Word) {
      return apiClient.post('/word-requests', dto)
    },
    approve(id: string, dto: Word) {
      return apiClient.put(`/word-requests/${id}/approve`, dto)
    },
    reject(id: string, reason: string) {
      return apiClient.put(`/word-requests/${id}/reject`, {reason})
    }
  },
  words: {
    search(query: string, limit: number = 100, filters?: Record<string, any>): Promise<AxiosResponse<WordSearchResponse>> {
      return apiClient.get('/words/search', { params: { q: query, limit, ...filters } })
    },
    details(id: string): Promise<AxiosResponse<Words>> {
      return apiClient.get(`/words/details/${id}`)
    },
  }
}

export default api