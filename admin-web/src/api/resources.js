import { api } from './client.js'

// --- auth ---
export const login = (dni, password) => api.post('/auth/login', { dni, password })
export const changePassword = (currentPassword, newPassword) =>
  api.post('/auth/change-password', { currentPassword, newPassword })

// --- empleados ---
export const getEmpleados = () => api.get('/employees')
export const createEmpleado = (data) => api.post('/employees', data)
export const resetEmpleadoPassword = (id) => api.patch(`/employees/${id}/reset-password`)
export const deactivateEmpleado = (id) => api.patch(`/employees/${id}/deactivate`)
export const reactivateEmpleado = (id) => api.patch(`/employees/${id}/reactivate`)
export const updateEmpleadoSede = (id, sedeId) => api.patch(`/employees/${id}/sede`, { sedeId })

// --- horarios ---
export const getHorarios = (empleadoId) => api.get(`/schedules/employee/${empleadoId}`)
export const createHorario = (data) => api.post('/schedules', data)
export const updateHorario = (id, data) => api.patch(`/schedules/${id}`, data)
export const deleteHorario = (id) => api.del(`/schedules/${id}`)

// --- asistencias ---
export const getAsistencias = (params = {}) => api.get(`/attendance${qs(params)}`)
export const updateAsistenciaAdmin = (id, data) => api.patch(`/attendance/${id}/admin`, data)

// --- solicitudes de corrección ---
export const getSolicitudes = (estado) => api.get(`/requests${qs({ estado })}`)
export const approveSolicitud = (id, data) => api.patch(`/requests/${id}/approve`, data)
export const rejectSolicitud = (id, motivo) => api.patch(`/requests/${id}/reject`, { motivo })

// --- empresas / sedes ---
export const getSedes = () => api.get('/sites')
export const createSede = (data) => api.post('/sites', data)
export const updateSede = (id, data) => api.patch(`/sites/${id}`, data)

// --- reportes ---
export const getReporteCsvBlob = (params = {}) => api.blob(`/reports/attendance.csv${qs(params)}`)

function qs(params) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
  const s = new URLSearchParams(clean).toString()
  return s ? `?${s}` : ''
}
