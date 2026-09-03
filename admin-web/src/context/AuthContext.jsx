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
    const nextUser = { ...data.usuario, debe_cambiar_password: data.debeCambiarPassword }
    if (nextUser.rol !== 'admin') {
      throw new Error('esta cuenta no tiene permisos de administrador')
    }
    setToken(data.accessToken)
    setTokenState(data.accessToken)
    saveStoredUser(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const changePassword = useCallback(
    async (actual, nueva) => {
      const data = await changePasswordRequest(actual, nueva)
      // El accessToken viejo todavía trae debe_cambiar_password=true codificado adentro;
      // sin reemplazarlo el backend seguiría bloqueando todo con PASSWORD_CHANGE_REQUIRED.
      setToken(data.accessToken)
      setTokenState(data.accessToken)
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
