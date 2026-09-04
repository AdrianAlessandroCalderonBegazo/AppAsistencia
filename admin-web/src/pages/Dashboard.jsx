import { useEffect, useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import { getEmpleados, getAsistencias } from '../api/resources.js'
import { PageHeader, Card, EmptyState } from '../components/ui.jsx'
import StatusPill from '../components/StatusPill.jsx'
import DataTable from '../components/DataTable.jsx'
import { todayIso } from '../utils/date.js'

// deriva un estado semántico simple a partir de las marcas de hoy de un empleado
// (puede haber varias marcas en un mismo día: entrada, salida a almuerzo, etc.)
function deriveStatus(marks) {
  if (!marks || marks.length === 0) return 'ausente'
  if (marks.some((m) => m.es_anomalia)) return 'con_anomalias'
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
          getEmpleados(),
          getAsistencias({ desde: fecha, hasta: fecha }),
        ])
        if (!active) return
        setEmpleados((empData || []).filter((e) => e.estado === 'activo'))
        setAsistenciasHoy(asisData || [])
      } catch (err) {
        if (active) setError(err.message || 'No se pudieron cargar los datos')
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
      if (mark.anulada) continue
      const list = map.get(mark.empleado_id) || []
      list.push(mark)
      map.set(mark.empleado_id, list)
    }
    return map
  }, [asistenciasHoy])

  const summary = useMemo(() => {
    const counts = { presente: 0, ausente: 0, con_anomalias: 0 }
    for (const emp of empleados) {
      const status = deriveStatus(marksByEmployee.get(emp.id))
      counts[status] += 1
    }
    return counts
  }, [empleados, marksByEmployee])

  const columns = [
    { key: 'nombre', header: 'Empleado' },
    { key: 'dni', header: 'DNI' },
    {
      key: 'estado',
      header: 'Estado hoy',
      render: (row) => <StatusPill status={deriveStatus(marksByEmployee.get(row.id))} />,
    },
    {
      key: 'entrada',
      header: 'Hora de entrada',
      render: (row) => {
        const entrada = marksByEmployee.get(row.id)?.find((m) => m.tipo_marca === 'entrada')
        if (!entrada) return '—'
        return new Date(entrada.hora_marcada).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Estado de asistencia de hoy para todo el personal activo"
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Presentes" value={summary.presente} tone="success" />
        <SummaryCard label="Con anomalías" value={summary.con_anomalias} tone="warning" />
        <SummaryCard label="Ausentes" value={summary.ausente} tone="danger" />
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text dark:bg-danger-darkBg dark:text-danger-darkText">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">Cargando…</Card>
      ) : empleados.length === 0 ? (
        <EmptyState message="Sin empleados activos por ahora" icon={Users} />
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
