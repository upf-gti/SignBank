
import { defineStore } from 'pinia'
import { Cookies } from 'quasar'
import { ref, computed } from 'vue'

const useUser = defineStore('user', () => {
    const access_token = ref(Cookies.get('access_token') ?? '')
    const role = ref(Cookies.get('role') ?? '')

    const isLoggedIn = computed(() => access_token.value !== '')
    const isAdmin = computed(() => role.value === 'ADMIN')
  
    function setUserData(data: { access_token: string, role: string }) {
        access_token.value = data.access_token
        role.value = data.role
        Cookies.set('access_token', data.access_token)
        Cookies.set('role', data.role)
    }
    function logout() {
        access_token.value = ''
        role.value = ''
        Cookies.remove('access_token')
        Cookies.remove('role')
        window.location.reload()
    }

    return { isLoggedIn, isAdmin, setUserData, access_token, role, logout }
})
  
export default useUser