import { useEffect, useState } from 'react'
import { Eye, ShieldCheck } from 'lucide-react'
import { getAuditoria, getEmpleados } from '../api/resources.js'
import { PageHeader, Card, Select, Input, Button, Banner, EmptyState } from '../components/ui.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import { todayIso, daysAgoIso } from '../utils/date.js'

const CAMPO_LABEL = {
  tipo_marca: 'Tipo de marca',
  hora_marcada: 'Hora marcada',
  latitud: 'Latitud',
  longitud: 'Longitud',
  es_anomalia: 'Es anomalía',
  motivo_anomalia: 'Motivo de anomalía',
  anulada: 'Eliminada',
}

function formatValor(campo, valor) {
  if (valor === null || valor === undefined) return '—'
  if (campo === 'hora_marcada') return new Date(valor).toLocaleString('es')
  if (campo === 'anulada' || campo === 'es_anomalia') return valor ? 'Sí' : 'No'
  return String(valor)
}

// Compara valor_anterior/valor_nuevo (JSONB) y muestra solo los campos que realmente cambiaron.
function camposModificados(anterior, nuevo) {
  const claves = Object.keys(CAMPO_LABEL).filter((k) => k in nuevo)
  return claves
    .filter((k) => JSON.stringify(anterior?.[k]) !== JSON.stringify(nuevo?.[k]))
    .map((k) => ({ campo: k, antes: anterior?.[k], despues: nuevo?.[k] }))
}

export default function Auditoria() {
  const [empleados, setEmpleados] = useState([])
  const [filters, setFilters] = useState({ empleadoId: '', desde: daysAgoIso(30), hasta: todayIso() })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [detalle, setDetalle] = useState(null)

  useEffect(() => {
    getEmpleados()
      .then((data) => setEmpleados(data || []))
      .catch(() => {})
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAuditoria(filters)
      setRows(data || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial de correcciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (row) => new Date(row.creado_en).toLocaleString('es'),
    },
    { key: 'empleado', header: 'Empleado', render: (row) => row.empleado_nombre || '—' },
    { key: 'admin', header: 'Realizado por', render: (row) => row.admin_nombre || '—' },
    {
      key: 'tipo',
      header: 'Tipo de cambio',
      render: (row) => (row.valor_nuevo?.anulada ? 'Eliminación' : row.valor_anterior?.anulada && !row.valor_nuevo?.anulada ? 'Restauración' : 'Corrección'),
    },
    { key: 'motivo', header: 'Motivo', render: (row) => <span className="whitespace-normal">{row.motivo}</span> },
    {
      key: 'accion',
      header: '',
      render: (row) => (
        <Button variant="secondary" onClick={() => setDetalle(row)} className="px-3 py-1.5 text-xs">
          <Eye size={14} />
          Ver detalle
        </Button>
      ),
    },
  ]

  const cambios = detalle ? camposModificados(detalle.valor_anterior, detalle.valor_nuevo) : []

  return (
    <div>
      <PageHeader
        title="Historial de correcciones"
        description="Cada corrección o eliminación hecha desde el panel queda registrada aquí, con quién la hizo y por qué"
      />

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
        <EmptyState icon={ShieldCheck} />
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}

      <Modal
        open={!!detalle}
        onClose={() => setDetalle(null)}
        title="Detalle de la corrección"
        footer={
          <Button variant="secondary" onClick={() => setDetalle(null)}>
            Cerrar
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <strong>Empleado:</strong> {detalle?.empleado_nombre || '—'} ({detalle?.empleado_dni || '—'})
            </p>
            <p>
              <strong>Realizado por:</strong> {detalle?.admin_nombre || '—'}
            </p>
            <p>
              <strong>Motivo:</strong> {detalle?.motivo}
            </p>
          </div>
          {cambios.length === 0 ? (
            <Banner tone="warning">No se detectaron cambios en los campos registrados.</Banner>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-neutral-border dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-border bg-neutral-bg/60 dark:border-zinc-800 dark:bg-zinc-900/60">
                    <th className="px-3 py-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Campo</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Antes</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Después</th>
                  </tr>
                </thead>
                <tbody>
                  {cambios.map((c) => (
                    <tr key={c.campo} className="border-b border-neutral-border last:border-0 dark:border-zinc-800">
                      <td className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">{CAMPO_LABEL[c.campo]}</td>
                      <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{formatValor(c.campo, c.antes)}</td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{formatValor(c.campo, c.despues)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
