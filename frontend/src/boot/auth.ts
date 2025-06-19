import { boot } from 'quasar/wrappers'
import { useAuthentication } from 'src/hooks/useAuthentication'

export default boot(async () => {
  const { verifyAuth } = useAuthentication()

  // Verify authentication once when the app starts
  try {
    await verifyAuth()
  } catch (error) {
    console.error('Authentication verification failed:', error)
  }
}) 