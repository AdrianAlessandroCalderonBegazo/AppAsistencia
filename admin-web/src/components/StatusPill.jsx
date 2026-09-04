const TONES = {
  success: 'bg-success-bg text-success-text dark:bg-success-darkBg dark:text-success-darkText',
  warning: 'bg-warning-bg text-warning-text dark:bg-warning-darkBg dark:text-warning-darkText',
  danger: 'bg-danger-bg text-danger-text dark:bg-danger-darkBg dark:text-danger-darkText',
  accent: 'bg-accent-bg text-accent-text dark:bg-accent-darkBg dark:text-accent-darkText',
  neutral: 'bg-neutral-bg text-neutral-text dark:bg-neutral-darkBg dark:text-neutral-darkText',
}

// mapeo centralizado de estados de negocio -> tono semántico + etiqueta en español
export const STATUS_MAP = {
  presente: { tone: 'success', label: 'Presente' },
  tarde: { tone: 'warning', label: 'Tarde' },
  ausente: { tone: 'danger', label: 'Ausente' },
  con_anomalias: { tone: 'warning', label: 'Con anomalías' },
  anomalia: { tone: 'warning', label: 'Anomalía' },
  dentro_area: { tone: 'success', label: 'Dentro de área' },
  fuera_area: { tone: 'danger', label: 'Fuera de área' },
  pendiente: { tone: 'warning', label: 'Pendiente' },
  aprobada: { tone: 'success', label: 'Aprobada' },
  rechazada: { tone: 'danger', label: 'Rechazada' },
  activo: { tone: 'success', label: 'Activo' },
  inactivo: { tone: 'neutral', label: 'Inactivo' },
  sincronizacion_tardia: { tone: 'accent', label: 'Sincronización tardía' },
  creada_por_solicitud: { tone: 'accent', label: 'Creada por solicitud aprobada' },
  editada: { tone: 'neutral', label: 'Editada por admin' },
}

export default function StatusPill({ status, tone, label, className = '' }) {
  const mapped = STATUS_MAP[status]
  const finalTone = tone || mapped?.tone || 'neutral'
  const finalLabel = label ?? mapped?.label ?? status ?? '—'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[finalTone]} ${className}`}
    >
      {finalLabel}
    </span>
  )
}
