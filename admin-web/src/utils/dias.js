// horarios.dias_semana en el backend es smallint[] con 0=domingo .. 6=sábado.
// Se listan empezando en lunes por legibilidad, pero cada value es el número real que espera el backend.
export const DIAS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

export const DIAS_LABORALES_DEFAULT = [1, 2, 3, 4, 5]
