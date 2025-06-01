import type { AxiosResponse } from "axios"
import { apiClient } from "src/boot/axios"
import type { GlossRequest, GlossData } from 'src/types/models'
import type { SearchParams } from "./search.service"

// Create API service object
export const api = {
  glosses: {
    get(id: string): Promise<AxiosResponse<any>> {
      return apiClient.get(`/glosses/${id}`)
    }
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
    upload(file: File): Promise<AxiosResponse<{ url: string }>> {
      const formData = new FormData()
      formData.append('video', file)
      return apiClient.post('/videos/upload', formData)
    },
    search(query: string): Promise<AxiosResponse<any>> {
      return apiClient.get(`/videos/search`, { params: { q: query } })
    }
  },
  search: {
    search(params: SearchParams): Promise<AxiosResponse<any>> {
      return apiClient.get(`/search`, { params })
    }
  }
}

export default api