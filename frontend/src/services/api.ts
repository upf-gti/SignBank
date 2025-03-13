import { apiClient } from "src/boot/axios"

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
  }
}

export default api