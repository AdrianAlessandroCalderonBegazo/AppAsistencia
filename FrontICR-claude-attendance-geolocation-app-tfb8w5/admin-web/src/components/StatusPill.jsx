const TONES = {
  success: 'bg-success-bg text-success-text dark:bg-success-darkBg dark:text-success-darkText',
  warning: 'bg-warning-bg text-warning-text dark:bg-warning-darkBg dark:text-warning-darkText',
  danger: 'bg-danger-bg text-danger-text dark:bg-danger-darkBg dark:text-danger-darkText',
  accent: 'bg-accent-bg text-accent-text dark:bg-accent-darkBg dark:text-accent-darkText',
  neutral: 'bg-neutral-bg text-neutral-text dark:bg-neutral-darkBg dark:text-neutral-darkText',
}

// mapeo centralizado de estados de negocio -> tono semántico + etiqueta en español
export const STATUS_MAP = {
  presente: { tone: 'success', label: 'presente' },
  tarde: { tone: 'warning', label: 'tarde' },
  ausente: { tone: 'danger', label: 'ausente' },
  con_anomalias: { tone: 'warning', label: 'con anomalías' },
  anomalia: { tone: 'warning', label: 'anomalía' },
  dentro_area: { tone: 'success', label: 'dentro de área' },
  fuera_area: { tone: 'danger', label: 'fuera de área' },
  pendiente: { tone: 'warning', label: 'pendiente' },
  aprobada: { tone: 'success', label: 'aprobada' },
  rechazada: { tone: 'danger', label: 'rechazada' },
  activo: { tone: 'success', label: 'activo' },
  inactivo: { tone: 'neutral', label: 'inactivo' },
  sincronizacion_tardia: { tone: 'accent', label: 'sincronización tardía' },
  creada_por_solicitud: { tone: 'accent', label: 'creada por solicitud aprobada' },
  editada: { tone: 'neutral', label: 'editada por admin' },
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
