import { api } from './client.js'

// --- auth ---
export const login = (dni, password) => api.post('/auth/login', { dni, password })
export const changePassword = (password_actual, password_nueva) =>
  api.post('/auth/change-password', { password_actual, password_nueva })

// --- empleados ---
export const getEmpleados = (params = {}) => api.get(`/empleados${qs(params)}`)
export const createEmpleado = (data) => api.post('/empleados', data)
export const updateEmpleado = (id, data) => api.patch(`/empleados/${id}`, data)
export const deactivateEmpleado = (id) => api.patch(`/empleados/${id}`, { activo: false })

// --- horarios ---
export const getHorarios = (empleadoId) =>
  api.get(`/horarios${empleadoId ? qs({ empleado_id: empleadoId }) : ''}`)
export const createHorario = (data) => api.post('/horarios', data)
export const updateHorario = (id, data) => api.patch(`/horarios/${id}`, data)

// --- asistencias ---
export const getAsistencias = (params = {}) => api.get(`/asistencias${qs(params)}`)
export const updateAsistencia = (id, data) => api.patch(`/asistencias/${id}`, data)

// --- solicitudes de corrección ---
export const getSolicitudes = (params = {}) => api.get(`/solicitudes_correccion${qs(params)}`)
export const resolveSolicitud = (id, estado, respuesta) =>
  api.patch(`/solicitudes_correccion/${id}`, { estado, respuesta })

// --- empresas / sedes ---
export const getSedes = () => api.get('/empresas_sedes')
export const updateSede = (id, data) => api.patch(`/empresas_sedes/${id}`, data)

// --- reportes ---
export const getReporteCsvBlob = (params = {}) => api.blob(`/reportes/export${qs(params)}`)

function qs(params) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
  const s = new URLSearchParams(clean).toString()
  return s ? `?${s}` : ''
}
