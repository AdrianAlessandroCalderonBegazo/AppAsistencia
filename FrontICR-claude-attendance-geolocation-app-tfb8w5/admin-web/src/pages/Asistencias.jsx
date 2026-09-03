import { useEffect, useState } from 'react'
import { Pencil, History } from 'lucide-react'
import { getEmpleados, getAsistencias, updateAsistencia } from '../api/resources.js'
import { PageHeader, Card, Select, Input, Button, Textarea, Banner, EmptyState } from '../components/ui.jsx'
import StatusPill from '../components/StatusPill.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
function daysAgoIso(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export default function Asistencias() {
  const [empleados, setEmpleados] = useState([])
  const [filters, setFilters] = useState({
    empleado_id: '',
    fecha_inicio: daysAgoIso(7),
    fecha_fin: todayIso(),
  })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [entradaEdit, setEntradaEdit] = useState('')
  const [salidaEdit, setSalidaEdit] = useState('')
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    getEmpleados({ activo: true })
      .then((data) => setEmpleados(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAsistencias(filters)
      setRows(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      setError(err.message || 'no se pudieron cargar las asistencias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openEdit(row) {
    setEditing(row)
    setEntradaEdit(row.hora_entrada || row.entrada || '')
    setSalidaEdit(row.hora_salida || row.salida || '')
    setMotivo('')
    setSaveError(null)
  }

  async function handleSave() {
    if (!motivo.trim()) {
      setSaveError('el motivo es obligatorio para corregir una marca')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await updateAsistencia(editing.id, {
        hora_entrada: entradaEdit || undefined,
        hora_salida: salidaEdit || undefined,
        motivo: motivo.trim(),
      })
      setEditing(null)
      await load()
    } catch (err) {
      setSaveError(err.message || 'no se pudo guardar la corrección')
    } finally {
      setSaving(false)
    }
  }

  function badgesFor(row) {
    const badges = []
    if (row.tiene_anomalia || row.anomalias?.length) badges.push('anomalia')
    if (row.sincronizacion_tardia || row.sync_tardio) badges.push('sincronizacion_tardia')
    if (row.creada_por_solicitud || row.origen === 'solicitud_aprobada') badges.push('creada_por_solicitud')
    if (row.editada_por_admin) badges.push('editada')
    return badges
  }

  const columns = [
    { key: 'empleado', header: 'empleado', render: (row) => row.empleado_nombre || row.empleado?.nombre || '—' },
    { key: 'fecha', header: 'fecha' },
    { key: 'entrada', header: 'entrada', render: (row) => row.hora_entrada || row.entrada || '—' },
    { key: 'salida', header: 'salida', render: (row) => row.hora_salida || row.salida || '—' },
    {
      key: 'estado',
      header: 'estado',
      render: (row) => <StatusPill status={row.estado || 'presente'} />,
    },
    {
      key: 'badges',
      header: 'detalles',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {badgesFor(row).map((b) => (
            <StatusPill key={b} status={b} />
          ))}
        </div>
      ),
    },
    {
      key: 'accion',
      header: '',
      render: (row) => (
        <Button variant="secondary" onClick={() => openEdit(row)} className="px-3 py-1.5 text-xs">
          <Pencil size={14} />
          corregir
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="asistencias" description="historial de marcas, con posibilidad de corrección" />

      {error && (
        <div className="mb-4">
          <Banner tone="danger">{error}</Banner>
        </div>
      )}

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Select
            label="empleado"
            value={filters.empleado_id}
            onChange={(e) => setFilters((f) => ({ ...f, empleado_id: e.target.value }))}
          >
            <option value="">todos</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
          <Input
            label="desde"
            type="date"
            value={filters.fecha_inicio}
            onChange={(e) => setFilters((f) => ({ ...f, fecha_inicio: e.target.value }))}
          />
          <Input
            label="hasta"
            type="date"
            value={filters.fecha_fin}
            onChange={(e) => setFilters((f) => ({ ...f, fecha_fin: e.target.value }))}
          />
          <div className="flex items-end">
            <Button onClick={load} className="w-full">
              filtrar
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">cargando…</Card>
      ) : rows.length === 0 ? (
        <EmptyState icon={History} />
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="corregir marca de asistencia"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'guardando…' : 'guardar corrección'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Banner tone="warning">
            toda corrección queda registrada en el historial junto con el motivo indicado.
          </Banner>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="hora de entrada"
              type="time"
              value={entradaEdit}
              onChange={(e) => setEntradaEdit(e.target.value)}
            />
            <Input
              label="hora de salida"
              type="time"
              value={salidaEdit}
              onChange={(e) => setSalidaEdit(e.target.value)}
            />
          </div>
          <Textarea
            label="motivo de la corrección (obligatorio)"
            placeholder="ej. el empleado olvidó marcar salida, se confirma con su jefe directo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            required
          />
          {saveError && <Banner tone="danger">{saveError}</Banner>}
        </div>
      </Modal>
    </div>
  )
}
