import { useEffect, useState } from 'react'
import { UserMinus, UserCheck, Search } from 'lucide-react'
import { getEmpleados, deactivateEmpleado, reactivateEmpleado } from '../api/resources.js'
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
  const [target, setTarget] = useState(null) // { row, decision: 'baja' | 'alta' }
  const [confirming, setConfirming] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getEmpleados()
      setEmpleados(data || [])
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

  async function confirmAction() {
    if (!target) return
    setConfirming(true)
    setError(null)
    try {
      if (target.decision === 'baja') {
        await deactivateEmpleado(target.row.id)
        setSuccess(`se dio de baja a ${target.row.nombre || target.row.dni}`)
      } else {
        await reactivateEmpleado(target.row.id)
        setSuccess(`se reactivó a ${target.row.nombre || target.row.dni}`)
      }
      setTarget(null)
      await load()
    } catch (err) {
      setError(err.message || 'no se pudo procesar el cambio')
    } finally {
      setConfirming(false)
    }
  }

  const columns = [
    { key: 'nombre', header: 'empleado' },
    { key: 'dni', header: 'dni' },
    {
      key: 'estado',
      header: 'estado',
      render: (row) => <StatusPill status={row.estado} />,
    },
    {
      key: 'accion',
      header: '',
      render: (row) =>
        row.estado === 'activo' ? (
          <Button variant="danger" onClick={() => setTarget({ row, decision: 'baja' })} className="px-3 py-1.5 text-xs">
            <UserMinus size={14} />
            dar de baja
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setTarget({ row, decision: 'alta' })} className="px-3 py-1.5 text-xs">
            <UserCheck size={14} />
            reactivar
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
        title={target?.decision === 'baja' ? 'confirmar baja' : 'confirmar reactivación'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>
              cancelar
            </Button>
            <Button
              variant={target?.decision === 'baja' ? 'danger' : 'primary'}
              onClick={confirmAction}
              disabled={confirming}
            >
              {confirming ? 'procesando…' : target?.decision === 'baja' ? 'sí, dar de baja' : 'sí, reactivar'}
            </Button>
          </>
        }
      >
        <p>
          {target?.decision === 'baja' ? (
            <>
              ¿confirmas que deseas dar de baja a <strong>{target?.row?.nombre || target?.row?.dni}</strong>? dejará
              de poder iniciar sesión, pero su historial de asistencia se conserva.
            </>
          ) : (
            <>
              ¿confirmas que deseas reactivar a <strong>{target?.row?.nombre || target?.row?.dni}</strong>? podrá
              volver a iniciar sesión y marcar asistencia.
            </>
          )}
        </p>
      </Modal>
    </div>
  )
}
