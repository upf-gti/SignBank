import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import useUser from 'src/stores/user.store'
import { useAuthentication } from 'src/hooks/useAuthentication'

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

console.log(process.env)
const api = axios.create({ baseURL: ('https://' + process.env.BASE_URL + '/api') });

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
    debugger
    const originalRequest = error.config;
    const auth = useAuthentication();

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest?.headers['X-Retry-After-Refresh']) {
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

    // If we get a 401 and we've already tried refreshing, or any other error
    if (error.response?.status === 401) {
      auth.logout();
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    return Promise.reject(error);
  }
);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api as apiClient };