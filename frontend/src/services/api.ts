import type { AxiosResponse } from "axios"
import { apiClient } from "src/boot/axios"
// Create API service object
export const api = {
  glosses: {
    get(id: string): Promise<AxiosResponse<any>> {
      return apiClient.get(`/glosses/${id}`)
    }
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
    }
  }
}

export default api