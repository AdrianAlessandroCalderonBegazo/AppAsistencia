import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { getToken, setToken, setUnauthorizedHandler } from '../api/client.js'
import { login as loginRequest, changePassword as changePasswordRequest } from '../api/resources.js'

const AuthContext = createContext(null)

const USER_KEY = 'icr_admin_user'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)
  const [token, setTokenState] = useState(getToken)
  const [authError, setAuthError] = useState(null)

  const logout = useCallback(() => {
    setToken(null)
    saveStoredUser(null)
    setTokenState(null)
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthError('tu sesión expiró, vuelve a iniciar sesión')
      logout()
    })
  }, [logout])

  const login = useCallback(async (dni, password) => {
    setAuthError(null)
    const data = await loginRequest(dni, password)
    const nextToken = data?.token || data?.access_token
    const nextUser = data?.usuario || data?.user || data?.empleado || null
    if (nextToken) {
      setToken(nextToken)
      setTokenState(nextToken)
    }
    saveStoredUser(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const changePassword = useCallback(
    async (actual, nueva) => {
      await changePasswordRequest(actual, nueva)
      const nextUser = { ...(user || {}), debe_cambiar_password: false }
      saveStoredUser(nextUser)
      setUser(nextUser)
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      mustChangePassword: !!user?.debe_cambiar_password,
      authError,
      clearAuthError: () => setAuthError(null),
      login,
      logout,
      changePassword,
    }),
    [user, token, authError, login, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
