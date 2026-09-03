// horarios.dias_semana en el backend es smallint[] con 0=domingo .. 6=sábado.
// Se listan empezando en lunes por legibilidad, pero cada value es el número real que espera el backend.
export const DIAS = [
  { value: 1, label: 'lunes' },
  { value: 2, label: 'martes' },
  { value: 3, label: 'miércoles' },
  { value: 4, label: 'jueves' },
  { value: 5, label: 'viernes' },
  { value: 6, label: 'sábado' },
  { value: 0, label: 'domingo' },
]

export const DIAS_LABORALES_DEFAULT = [1, 2, 3, 4, 5]
