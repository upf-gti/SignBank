import { ref, computed } from 'vue'
import { api } from 'src/services/api'
import useUser from 'src/stores/user.store'
import router from 'src/router'

export function useAuthentication() {
  const userStore = useUser()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isRefreshing = ref(false)

  const isAuthenticated = computed(() => userStore.isLoggedIn)
  const isAdmin = computed(() => userStore.isAdmin)

  async function login(email: string, password: string) {
    try {
      isLoading.value = true
      error.value = null
      const { data } = await api.login({ email, password })
      userStore.setUserData(data)
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(username: string, email: string, password: string) {
    try {
      isLoading.value = true
      error.value = null
      const { data } = await api.register({ username, email, password })
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function refreshToken() {
    if (isRefreshing.value) {
      // If a refresh is already in progress, wait for it
      return new Promise((resolve) => {
        const checkRefreshing = setInterval(() => {
          if (!isRefreshing.value) {
            clearInterval(checkRefreshing)
            resolve(true)
          }
        }, 100)
      })
    }

    try {
      isRefreshing.value = true
      const { data } = await api.refreshToken({ refresh_token: userStore.refresh_token })
      debugger
      userStore.setTokens(data)
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Token refresh failed'
      userStore.logout()
      throw err
    } finally {
      isRefreshing.value = false
    }
  }

  function logout() {
    userStore.logout()
    router.push()
  }

  return {
    login,
    register,
    logout,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    isAdmin
  }
}
