import type { AxiosResponse } from "axios"
import { apiClient } from "src/boot/axios"
import type {  Words, Word } from "src/types/word"
import type { WordRequest, WordRequests } from "src/types/wordRequest"
import type { WordSearchResponse } from "src/types/wordSearch"

// Create API service object
export const api = {
  login(credentials: { email: string, password: string }) {
    return apiClient.post('/auth/login', credentials)
  },
  register(credentials: { username: string, email: string, password: string }) {
    return apiClient.post('/auth/register', credentials)
  },
  wordRequests: {
    get(id?: string): Promise<AxiosResponse<WordRequest | WordRequests>> {
      return apiClient.get(`/word-requests${id ? `/${id}` : ''}`)
    },
    getPending() {
      return apiClient.get('/word-requests/pending')
    },
    post(dto: Word) {
      return apiClient.post('/word-requests', dto)
    },
    put(id: string, dto: Word) {
      return apiClient.put(`/word-requests/${id}`, dto)
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
    create(word: Words): Promise<AxiosResponse<Words>> {
      return apiClient.post('/words', word)
    },
    requestEdit(word: Words): Promise<AxiosResponse<any>> {
      return apiClient.post(`/words/edit-requests`, word)
    }
  }
}

export default api