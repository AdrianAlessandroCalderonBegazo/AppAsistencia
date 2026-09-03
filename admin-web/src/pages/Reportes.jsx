import { useEffect, useState } from 'react'
import { FileDown, Download } from 'lucide-react'
import { getEmpleados, getReporteCsvBlob } from '../api/resources.js'
import { PageHeader, Card, Select, Input, Button, Banner } from '../components/ui.jsx'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
function daysAgoIso(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export default function Reportes() {
  const [empleados, setEmpleados] = useState([])
  const [empleadoId, setEmpleadoId] = useState('')
  const [fechaInicio, setFechaInicio] = useState(daysAgoIso(30))
  const [fechaFin, setFechaFin] = useState(todayIso())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    getEmpleados({ activo: true })
      .then((data) => setEmpleados(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
  }, [])

  async function handleExport() {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const blob = await getReporteCsvBlob({
        empleado_id: empleadoId || undefined,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_asistencias_${fechaInicio}_${fechaFin}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setSuccess('el archivo se descargó correctamente')
    } catch (err) {
      setError(err.message || 'no se pudo generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="reportes" description="exporta el historial de asistencias en formato csv" />

      {success && (
        <div className="mb-4">
          <Banner tone="success">{success}</Banner>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Banner tone="danger">{error}</Banner>
        </div>
      )}

      <Card>
        <div className="mb-4 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <FileDown size={18} />
          <span className="text-sm font-medium">parámetros del reporte</span>
        </div>

        <div className="flex flex-col gap-4">
          <Select label="empleado" value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}>
            <option value="">todos los empleados</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input label="desde" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            <Input label="hasta" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>

          <Button onClick={handleExport} disabled={loading} className="mt-2 w-full">
            <Download size={16} />
            {loading ? 'generando…' : 'descargar csv'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
