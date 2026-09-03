import { useEffect, useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import { getEmpleados, getAsistencias } from '../api/resources.js'
import { PageHeader, Card, EmptyState } from '../components/ui.jsx'
import StatusPill from '../components/StatusPill.jsx'
import DataTable from '../components/DataTable.jsx'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

// deriva un estado semántico simple a partir de la marca de asistencia del día
function deriveStatus(mark) {
  if (!mark) return 'ausente'
  if (mark.estado) return mark.estado
  if (mark.anomalias?.length || mark.tiene_anomalia) return 'con_anomalias'
  if (mark.tarde || mark.llego_tarde) return 'tarde'
  return 'presente'
}

export default function Dashboard() {
  const [empleados, setEmpleados] = useState([])
  const [asistenciasHoy, setAsistenciasHoy] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const fecha = todayIso()
        const [empData, asisData] = await Promise.all([
          getEmpleados({ activo: true }),
          getAsistencias({ fecha_inicio: fecha, fecha_fin: fecha }),
        ])
        if (!active) return
        setEmpleados(Array.isArray(empData) ? empData : empData?.data || [])
        setAsistenciasHoy(Array.isArray(asisData) ? asisData : asisData?.data || [])
      } catch (err) {
        if (active) setError(err.message || 'no se pudieron cargar los datos')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const marksByEmployee = useMemo(() => {
    const map = new Map()
    for (const mark of asistenciasHoy) {
      const empId = mark.empleado_id ?? mark.empleadoId ?? mark.empleado?.id
      if (empId != null) map.set(empId, mark)
    }
    return map
  }, [asistenciasHoy])

  const summary = useMemo(() => {
    const counts = { presente: 0, tarde: 0, ausente: 0, con_anomalias: 0 }
    for (const emp of empleados) {
      const status = deriveStatus(marksByEmployee.get(emp.id))
      if (counts[status] !== undefined) counts[status] += 1
    }
    return counts
  }, [empleados, marksByEmployee])

  const columns = [
    { key: 'nombre', header: 'empleado', render: (row) => row.nombre || row.nombre_completo || '—' },
    { key: 'dni', header: 'dni' },
    { key: 'sede', header: 'sede', render: (row) => row.sede_nombre || row.sede?.nombre || '—' },
    {
      key: 'estado',
      header: 'estado hoy',
      render: (row) => <StatusPill status={deriveStatus(marksByEmployee.get(row.id))} />,
    },
    {
      key: 'hora',
      header: 'hora de entrada',
      render: (row) => marksByEmployee.get(row.id)?.hora_entrada || marksByEmployee.get(row.id)?.entrada || '—',
    },
  ]

  return (
    <div>
      <PageHeader
        title="dashboard"
        description="estado de asistencia de hoy para todo el personal activo"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="presentes" value={summary.presente} tone="success" />
        <SummaryCard label="tarde" value={summary.tarde} tone="warning" />
        <SummaryCard label="con anomalías" value={summary.con_anomalias} tone="warning" />
        <SummaryCard label="ausentes" value={summary.ausente} tone="danger" />
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text dark:bg-danger-darkBg dark:text-danger-darkText">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">cargando…</Card>
      ) : empleados.length === 0 ? (
        <EmptyState message="sin resultados por ahora" icon={Users} />
      ) : (
        <DataTable columns={columns} rows={empleados} />
      )}
    </div>
  )
}

function SummaryCard({ label, value, tone }) {
  const tones = {
    success: 'text-success-solid',
    warning: 'text-warning-solid',
    danger: 'text-danger-solid',
  }
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <span className={`text-2xl font-semibold ${tones[tone]}`}>{value}</span>
    </Card>
  )
}
