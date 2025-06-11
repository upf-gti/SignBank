import { boot } from 'quasar/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import useUser from 'src/stores/user.store'
import { useAuthentication } from 'src/hooks/useAuthentication'

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Get BASE_URL from environment or use default for development
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.hostname;
const api = axios.create({ 
  baseURL: `${window.location.protocol}//${BASE_URL}/api`,
  withCredentials: true
});

// Add request interceptor
api.interceptors.request.use(config => {
  const userStore = useUser()
  const token = userStore.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const auth = useAuthentication();

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401) {
      // Check if this is the refresh token request
      if (originalRequest?.url?.includes('/auth/refresh')) {
        auth.logout();
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      // For other 401s, try refreshing if we haven't already
      if (!originalRequest?.headers['X-Retry-After-Refresh']) {
        try {
          // Try to refresh the token
          await auth.refreshToken();
          
          // Update the original request with the new token
          if (originalRequest) {
            originalRequest.headers['X-Retry-After-Refresh'] = 'true';
            const userStore = useUser();
            originalRequest.headers.Authorization = `Bearer ${userStore.access_token}`;
            
            // Retry the original request
            return api(originalRequest);
          }
        } catch {
          // If refresh fails, logout the user and reject with a specific error
          auth.logout();
          return Promise.reject(new Error('Session expired. Please login again.'));
        }
      }
    }

    // If we get a 401 and we've already tried refreshing, or any other error
    if (error.response?.status === 401) {
      auth.logout();
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api as apiClient };