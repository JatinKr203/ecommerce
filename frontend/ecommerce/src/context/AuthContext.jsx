import { useEffect, useMemo, useState } from 'react'
import { authApi, profileApi } from '../services/api'
import AuthContext from './auth-context-value'

const TOKEN_KEY = 'kitchenly_token'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const handleUnauthorized = () => setUser(null)
    window.addEventListener('kitchenly:unauthorized', handleUnauthorized)

    const restoreUser = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setInitializing(false)
        return
      }
      try {
        const { data } = await profileApi.get()
        setUser(data.user)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      } finally {
        setInitializing(false)
      }
    }

    restoreUser()
    return () => window.removeEventListener('kitchenly:unauthorized', handleUnauthorized)
  }, [])

  const value = useMemo(() => ({
    user,
    initializing,
    isAuthenticated: Boolean(user),
    async register(payload) {
      const { data } = await authApi.register(payload)
      return data.user
    },
    async login(payload) {
      const { data } = await authApi.login(payload)
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return data.user
    },
    async updateProfile(payload) {
      const { data } = await profileApi.update(payload)
      setUser(data.user)
      return data.user
    },
    logout() {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    },
  }), [initializing, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider