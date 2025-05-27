import { defineStore } from 'pinia'
import { Cookies } from 'quasar'
import { ref, computed } from 'vue'
import type { User } from 'src/types/models'
import router from 'src/router'

const useUser = defineStore('user', () => {
    const access_token = ref(Cookies.get('access_token') ?? '')
    const refresh_token = ref(Cookies.get('refresh_token') ?? '')
    const role = ref(Cookies.get('role') ?? '')

    const isLoggedIn = computed(() => access_token.value !== '')
    const isAdmin = computed(() => role.value === 'ADMIN')
  
    function setUserData(data: { access_token: string, refresh_token: string, user: User }) {
        access_token.value = data.access_token
        refresh_token.value = data.refresh_token
        role.value = data.user.role
        Cookies.set('access_token', data.access_token)
        Cookies.set('refresh_token', data.refresh_token)
        Cookies.set('role', data.user.role)
    }

    function setTokens(tokens: { access_token: string, refresh_token: string }) {
        access_token.value = tokens.access_token
        refresh_token.value = tokens.refresh_token
        Cookies.set('access_token', tokens.access_token)
        Cookies.set('refresh_token', tokens.refresh_token)
    }
    
    function logout() {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        Cookies.remove('role')
        access_token.value = ''
        refresh_token.value = ''
        role.value = ''
        router.push('/')
    }

    return { 
        isLoggedIn, 
        isAdmin, 
        setUserData, 
        setTokens,
        access_token, 
        refresh_token,
        role, 
        logout 
    }
})
  
export default useUser