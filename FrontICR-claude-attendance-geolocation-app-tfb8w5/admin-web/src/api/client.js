const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const TOKEN_KEY = 'icr_admin_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.)
  }
}

// callback que App/AuthContext registra para reaccionar a un 401 global
let onUnauthorized = () => {}
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(path, { method = 'GET', body, headers, isBlob = false, ...rest } = {}) {
  const token = getToken()
  const finalHeaders = {
    ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      ...rest,
    })
  } catch (err) {
    throw new ApiError('no se pudo conectar con el servidor', 0, null)
  }

  if (res.status === 401) {
    onUnauthorized()
    throw new ApiError('sesión expirada, vuelve a iniciar sesión', 401, null)
  }

  if (isBlob) {
    if (!res.ok) throw new ApiError('no se pudo generar el archivo', res.status, null)
    return res.blob()
  }

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const message = data?.message || data?.error || `error ${res.status}`
    throw new ApiError(message, res.status, data)
  }

  return data
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  blob: (path, opts) => request(path, { ...opts, method: 'GET', isBlob: true }),
}

export { ApiError, BASE_URL }
