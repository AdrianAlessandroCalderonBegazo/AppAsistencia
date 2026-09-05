import { useEffect, useState } from 'react'
import { FileDown, Download, BarChart3 } from 'lucide-react'
import { getEmpleados, getReporteCsvBlob, getReporteResumen } from '../api/resources.js'
import { PageHeader, Card, Select, Input, Button, Banner, EmptyState } from '../components/ui.jsx'
import DataTable from '../components/DataTable.jsx'
import { todayIso, daysAgoIso } from '../utils/date.js'

export default function Reportes() {
  const [empleados, setEmpleados] = useState([])
  const [empleadoId, setEmpleadoId] = useState('')
  const [fechaInicio, setFechaInicio] = useState(daysAgoIso(30))
  const [fechaFin, setFechaFin] = useState(todayIso())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [resumen, setResumen] = useState([])
  const [resumenLoading, setResumenLoading] = useState(true)
  const [resumenError, setResumenError] = useState(null)

  useEffect(() => {
    getEmpleados()
      .then((data) => setEmpleados((data || []).filter((e) => e.estado === 'activo')))
      .catch(() => {})
  }, [])

  async function loadResumen() {
    setResumenLoading(true)
    setResumenError(null)
    try {
      const data = await getReporteResumen({
        empleadoId: empleadoId || undefined,
        desde: fechaInicio,
        hasta: fechaFin,
      })
      setResumen(data || [])
    } catch (err) {
      setResumenError(err.message || 'No se pudo cargar el resumen')
    } finally {
      setResumenLoading(false)
    }
  }

  useEffect(() => {
    loadResumen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleExport() {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const blob = await getReporteCsvBlob({
        empleadoId: empleadoId || undefined,
        desde: fechaInicio,
        hasta: fechaFin,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_asistencias_${fechaInicio}_${fechaFin}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setSuccess('El archivo se descargó correctamente')
    } catch (err) {
      setError(err.message || 'No se pudo generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const columnasResumen = [
    { key: 'nombre', header: 'Empleado' },
    { key: 'diasConMarca', header: 'Días con marca' },
    { key: 'horasTrabajadas', header: 'Horas trabajadas', render: (r) => r.horasTrabajadas.toFixed(2) },
    { key: 'tardanzas', header: 'Tardanzas' },
    { key: 'salidasAnticipadas', header: 'Salidas anticipadas' },
    { key: 'marcasFueraDeArea', header: 'Marcas fuera de área' },
    { key: 'anomalias', header: 'Anomalías totales' },
  ]

  return (
    <div>
      <PageHeader title="Reportes" description="Exporta el historial de asistencias y revisa un resumen por empleado" />

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

      <Card className="mb-4">
        <div className="mb-4 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <FileDown size={18} />
          <span className="text-sm font-medium">Parámetros del reporte</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Select label="Empleado" value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}>
            <option value="">Todos los empleados</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
          <Input label="Desde" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          <Input label="Hasta" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={loadResumen} disabled={resumenLoading} className="w-full">
              Actualizar resumen
            </Button>
          </div>
        </div>

        <Button onClick={handleExport} disabled={loading} className="mt-4 w-full sm:w-auto">
          <Download size={16} />
          {loading ? 'Generando…' : 'Descargar CSV'}
        </Button>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <BarChart3 size={18} />
          <span className="text-sm font-medium">Resumen por empleado</span>
        </div>

        {resumenError && (
          <div className="mb-4">
            <Banner tone="danger">{resumenError}</Banner>
          </div>
        )}

        {resumenLoading ? (
          <div className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">Cargando…</div>
        ) : resumen.length === 0 ? (
          <EmptyState icon={BarChart3} />
        ) : (
          <DataTable columns={columnasResumen} rows={resumen} rowKey="empleadoId" />
        )}
      </Card>
    </div>
  )
}
