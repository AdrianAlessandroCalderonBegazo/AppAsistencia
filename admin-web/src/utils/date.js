// Fecha calendario LOCAL (no UTC): Date#toISOString() siempre convierte a UTC, lo que puede
// devolver "mañana" o "ayer" según la hora y la zona horaria del navegador — y eso rompe
// filtros de "hoy" (ver también mobile-app: mismo bug, mismo motivo, ya corregido ahí).
function toLocalIso(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayIso() {
  return toLocalIso(new Date())
}

export function daysAgoIso(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toLocalIso(d)
}
