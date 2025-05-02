
import { defineStore } from 'pinia'
import { Cookies } from 'quasar'
import type { User } from 'src/types/database'
import { ref, computed } from 'vue'

const useUser = defineStore('user', () => {
    const access_token = ref(Cookies.get('access_token') ?? '')
    const role = ref(Cookies.get('role') ?? '')

    const isLoggedIn = computed(() => access_token.value !== '')
    const isAdmin = computed(() => role.value === 'ADMIN')
  
    function setUserData(data: { access_token: string, user: User }) {
        access_token.value = data.access_token
        role.value = data.user.role
        Cookies.set('access_token', data.access_token)
        Cookies.set('role', data.user.role)
    }
    function logout() {
        access_token.value = ''
        role.value = ''
        Cookies.remove('access_token')
        Cookies.remove('role')
        setTimeout(() => {
            window.location.reload()
        }, 100)
    }

    return { isLoggedIn, isAdmin, setUserData, access_token, role, logout }
})
  
export default useUser