import { useEffect, useState } from 'react'
import { Pencil, History } from 'lucide-react'
import { getEmpleados, getAsistencias, updateAsistenciaAdmin } from '../api/resources.js'
import { PageHeader, Card, Select, Input, Button, Textarea, Banner, EmptyState } from '../components/ui.jsx'
import StatusPill from '../components/StatusPill.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'

const TIPOS_MARCA = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida_almuerzo', label: 'Salida a almuerzo' },
  { value: 'regreso_almuerzo', label: 'Regreso de almuerzo' },
  { value: 'salida', label: 'Salida final' },
]

function tipoLabel(tipo) {
  return TIPOS_MARCA.find((t) => t.value === tipo)?.label || tipo
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
function daysAgoIso(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// "2024-05-01T13:00:00.000Z" -> valor válido para <input type="datetime-local">
function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Asistencias() {
  const [empleados, setEmpleados] = useState([])
  const [filters, setFilters] = useState({
    empleadoId: '',
    desde: daysAgoIso(7),
    hasta: todayIso(),
  })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [tipoMarcaEdit, setTipoMarcaEdit] = useState('entrada')
  const [horaEdit, setHoraEdit] = useState('')
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    getEmpleados()
      .then((data) => setEmpleados((data || []).filter((e) => e.estado === 'activo')))
      .catch(() => {})
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAsistencias(filters)
      setRows(data || [])
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las asistencias')
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
    setTipoMarcaEdit(row.tipo_marca)
    setHoraEdit(toDatetimeLocal(row.hora_marcada))
    setMotivo('')
    setSaveError(null)
  }

  async function handleSave() {
    if (!motivo.trim()) {
      setSaveError('El motivo es obligatorio para corregir una marca')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await updateAsistenciaAdmin(editing.id, {
        tipoMarca: tipoMarcaEdit,
        horaMarcada: horaEdit ? new Date(horaEdit).toISOString() : undefined,
        motivo: motivo.trim(),
      })
      setEditing(null)
      await load()
    } catch (err) {
      setSaveError(err.message || 'No se pudo guardar la corrección')
    } finally {
      setSaving(false)
    }
  }

  function badgesFor(row) {
    const badges = []
    if (row.es_anomalia) badges.push('anomalia')
    if (row.sincronizacion_tardia) badges.push('sincronizacion_tardia')
    if (row.origen === 'solicitud_aprobada') badges.push('creada_por_solicitud')
    if (row.origen === 'correccion_admin') badges.push('editada')
    if (row.anulada) badges.push('inactivo')
    return badges
  }

  const columns = [
    { key: 'empleado', header: 'Empleado', render: (row) => row.empleado_nombre || '—' },
    { key: 'fecha', header: 'Fecha' },
    { key: 'tipo_marca', header: 'Tipo de marca', render: (row) => tipoLabel(row.tipo_marca) },
    {
      key: 'hora',
      header: 'Hora',
      render: (row) => new Date(row.hora_marcada).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      key: 'area',
      header: 'Ubicación',
      render: (row) => <StatusPill status={row.dentro_area ? 'dentro_area' : 'fuera_area'} />,
    },
    {
      key: 'badges',
      header: 'Detalles',
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
          Corregir
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Asistencias" description="Historial de marcas, con posibilidad de corrección" />

      {error && (
        <div className="mb-4">
          <Banner tone="danger">{error}</Banner>
        </div>
      )}

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Select
            label="Empleado"
            value={filters.empleadoId}
            onChange={(e) => setFilters((f) => ({ ...f, empleadoId: e.target.value }))}
          >
            <option value="">Todos</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
          <Input
            label="Desde"
            type="date"
            value={filters.desde}
            onChange={(e) => setFilters((f) => ({ ...f, desde: e.target.value }))}
          />
          <Input
            label="Hasta"
            type="date"
            value={filters.hasta}
            onChange={(e) => setFilters((f) => ({ ...f, hasta: e.target.value }))}
          />
          <div className="flex items-end">
            <Button onClick={load} className="w-full">
              Filtrar
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">Cargando…</Card>
      ) : rows.length === 0 ? (
        <EmptyState icon={History} />
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Corregir marca de asistencia"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar corrección'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Banner tone="warning">
            Toda corrección queda registrada en el historial junto con el motivo indicado.
          </Banner>
          <Select label="Tipo de marca" value={tipoMarcaEdit} onChange={(e) => setTipoMarcaEdit(e.target.value)}>
            {TIPOS_MARCA.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <Input
            label="Fecha y hora"
            type="datetime-local"
            value={horaEdit}
            onChange={(e) => setHoraEdit(e.target.value)}
          />
          <Textarea
            label="Motivo de la corrección (obligatorio)"
            placeholder="Ej. el empleado olvidó marcar salida, se confirma con su jefe directo"
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
