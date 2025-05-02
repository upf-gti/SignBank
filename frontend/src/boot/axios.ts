import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import useUser from 'src/stores/user.store'

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({ baseURL: process.env.BACKEND_URL || 'https://signbank.upf.com/api' });

// Add interceptor to the api instance instead of global axios
api.interceptors.request.use(config => {
  const userStore = useUser()

  const token = userStore.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api as apiClient };