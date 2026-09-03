import { useEffect, useState } from 'react'
import { UserMinus, Search } from 'lucide-react'
import { getEmpleados, deactivateEmpleado } from '../api/resources.js'
import { PageHeader, Card, Input, Button, Banner, EmptyState } from '../components/ui.jsx'
import StatusPill from '../components/StatusPill.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'

export default function EmpleadoBaja() {
  const [empleados, setEmpleados] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [target, setTarget] = useState(null)
  const [confirming, setConfirming] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getEmpleados()
      setEmpleados(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      setError(err.message || 'no se pudieron cargar los empleados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = empleados.filter((e) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    return (
      (e.nombre || '').toLowerCase().includes(term) ||
      (e.dni || '').toLowerCase().includes(term)
    )
  })

  async function confirmDeactivate() {
    if (!target) return
    setConfirming(true)
    setError(null)
    try {
      await deactivateEmpleado(target.id)
      setSuccess(`se dio de baja a ${target.nombre || target.dni}`)
      setTarget(null)
      await load()
    } catch (err) {
      setError(err.message || 'no se pudo dar de baja al empleado')
    } finally {
      setConfirming(false)
    }
  }

  const columns = [
    { key: 'nombre', header: 'empleado' },
    { key: 'dni', header: 'dni' },
    {
      key: 'activo',
      header: 'estado',
      render: (row) => <StatusPill status={row.activo === false ? 'inactivo' : 'activo'} />,
    },
    {
      key: 'accion',
      header: '',
      render: (row) =>
        row.activo === false ? (
          <span className="text-xs text-zinc-400">ya inactivo</span>
        ) : (
          <Button variant="danger" onClick={() => setTarget(row)} className="px-3 py-1.5 text-xs">
            <UserMinus size={14} />
            dar de baja
          </Button>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="baja de empleado"
        description="desactiva a un empleado que ya no forma parte del equipo"
      />

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
        <Input
          placeholder="buscar por nombre o dni…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">cargando…</Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="confirmar baja"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>
              cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeactivate} disabled={confirming}>
              {confirming ? 'procesando…' : 'sí, dar de baja'}
            </Button>
          </>
        }
      >
        <p>
          ¿confirmas que deseas dar de baja a{' '}
          <strong>{target?.nombre || target?.dni}</strong>? dejará de poder marcar asistencia, pero su
          historial se conserva.
        </p>
      </Modal>
    </div>
  )
}
