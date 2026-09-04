import { useEffect, useState } from 'react'
import { UserMinus, UserCheck, KeyRound, Building2, Search } from 'lucide-react'
import {
  getEmpleados,
  deactivateEmpleado,
  reactivateEmpleado,
  resetEmpleadoPassword,
  getSedes,
  updateEmpleadoSedes,
} from '../api/resources.js'
import { PageHeader, Card, Input, Button, Banner, EmptyState } from '../components/ui.jsx'
import StatusPill from '../components/StatusPill.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'

// misma regla que backend/src/utils/genericPassword.js — solo para mostrarle al admin
// qué contraseña le toca comunicar al empleado (el backend nunca la devuelve en texto plano).
function genericPasswordFor(dni) {
  const digits = String(dni).replace(/\D/g, '').padEnd(4, '0').slice(0, 4)
  return `${digits}Asis`
}

export default function EmpleadoBaja() {
  const [empleados, setEmpleados] = useState([])
  const [sedes, setSedes] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [target, setTarget] = useState(null) // { row, decision: 'baja' | 'alta' | 'reset' }
  const [confirming, setConfirming] = useState(false)

  const [sedesEditing, setSedesEditing] = useState(null) // empleado en edición de sedes
  const [sedesSeleccionadas, setSedesSeleccionadas] = useState([])
  const [savingSedes, setSavingSedes] = useState(false)
  const [sedesError, setSedesError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [empleadosData, sedesData] = await Promise.all([getEmpleados(), getSedes()])
      setEmpleados(empleadosData || [])
      setSedes(sedesData || [])
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los empleados')
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
        setSuccess(`Se dio de baja a ${target.row.nombre || target.row.dni}`)
        setTarget(null)
      } else if (target.decision === 'alta') {
        await reactivateEmpleado(target.row.id)
        setSuccess(`Se reactivó a ${target.row.nombre || target.row.dni}`)
        setTarget(null)
      } else {
        await resetEmpleadoPassword(target.row.id)
        const password = genericPasswordFor(target.row.dni)
        setSuccess(
          `La contraseña de ${target.row.nombre || target.row.dni} fue restablecida a "${password}" — deberá cambiarla al ingresar de nuevo.`,
        )
        setTarget(null)
      }
      await load()
    } catch (err) {
      setError(err.message || 'No se pudo procesar el cambio')
    } finally {
      setConfirming(false)
    }
  }

  function openSedesEdit(row) {
    setSedesEditing(row)
    setSedesSeleccionadas((row.sedes || []).map((s) => s.id))
    setSedesError(null)
  }

  function toggleSedeSeleccionada(sedeId) {
    setSedesSeleccionadas((ids) =>
      ids.includes(sedeId) ? ids.filter((id) => id !== sedeId) : [...ids, sedeId],
    )
  }

  async function saveSedes() {
    if (sedesSeleccionadas.length === 0) {
      setSedesError('Selecciona al menos una sede')
      return
    }
    setSavingSedes(true)
    setSedesError(null)
    try {
      await updateEmpleadoSedes(sedesEditing.id, sedesSeleccionadas)
      setSedesEditing(null)
      setSuccess(`Se actualizaron las sedes de ${sedesEditing.nombre || sedesEditing.dni}`)
      await load()
    } catch (err) {
      setSedesError(err.message || 'No se pudieron guardar las sedes')
    } finally {
      setSavingSedes(false)
    }
  }

  const columns = [
    { key: 'nombre', header: 'Empleado' },
    { key: 'dni', header: 'DNI' },
    {
      key: 'sedes',
      header: 'Sedes',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.sedes || []).length === 0 ? (
            <span className="text-xs text-zinc-400">sin sede</span>
          ) : (
            row.sedes.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-neutral-bg px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {s.nombre}
              </span>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <StatusPill status={row.estado} />,
    },
    {
      key: 'accion',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => openSedesEdit(row)} className="px-3 py-1.5 text-xs">
            <Building2 size={14} />
            Sedes
          </Button>
          <Button
            variant="secondary"
            onClick={() => setTarget({ row, decision: 'reset' })}
            className="px-3 py-1.5 text-xs"
          >
            <KeyRound size={14} />
            Restablecer contraseña
          </Button>
          {row.estado === 'activo' ? (
            <Button variant="danger" onClick={() => setTarget({ row, decision: 'baja' })} className="px-3 py-1.5 text-xs">
              <UserMinus size={14} />
              Dar de baja
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setTarget({ row, decision: 'alta' })} className="px-3 py-1.5 text-xs">
              <UserCheck size={14} />
              Reactivar
            </Button>
          )}
        </div>
      ),
    },
  ]

  const modalTitle = {
    baja: 'Confirmar baja',
    alta: 'Confirmar reactivación',
    reset: 'Restablecer contraseña',
  }[target?.decision]

  const modalConfirmLabel = {
    baja: 'Sí, dar de baja',
    alta: 'Sí, reactivar',
    reset: 'Sí, restablecer',
  }[target?.decision]

  return (
    <div>
      <PageHeader
        title="Gestión de empleados"
        description="Da de baja, reactiva, cambia las sedes o restablece la contraseña de un empleado"
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
          placeholder="Buscar por nombre o DNI…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">Cargando…</Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title={modalTitle}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant={target?.decision === 'baja' ? 'danger' : 'primary'}
              onClick={confirmAction}
              disabled={confirming}
            >
              {confirming ? 'Procesando…' : modalConfirmLabel}
            </Button>
          </>
        }
      >
        <p>
          {target?.decision === 'baja' && (
            <>
              ¿Confirmas que deseas dar de baja a <strong>{target?.row?.nombre || target?.row?.dni}</strong>? Dejará
              de poder iniciar sesión, pero su historial de asistencia se conserva.
            </>
          )}
          {target?.decision === 'alta' && (
            <>
              ¿Confirmas que deseas reactivar a <strong>{target?.row?.nombre || target?.row?.dni}</strong>? Podrá
              volver a iniciar sesión y marcar asistencia.
            </>
          )}
          {target?.decision === 'reset' && (
            <>
              La contraseña de <strong>{target?.row?.nombre || target?.row?.dni}</strong> volverá a ser la genérica
              (según su DNI), y deberá cambiarla al iniciar sesión de nuevo. Útil si la olvidó.
            </>
          )}
        </p>
      </Modal>

      <Modal
        open={!!sedesEditing}
        onClose={() => setSedesEditing(null)}
        title="Sedes asignadas"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSedesEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={saveSedes} disabled={savingSedes}>
              {savingSedes ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p>
            Elige en qué sede o sedes puede marcar <strong>{sedesEditing?.nombre || sedesEditing?.dni}</strong>. Si
            selecciona más de una, podrá marcar en cualquiera indistintamente — útil si rota entre locales o cambia
            de sede a mitad de jornada.
          </p>
          <div className="flex flex-wrap gap-2">
            {sedes.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleSedeSeleccionada(s.id)}
                className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                  sedesSeleccionadas.includes(s.id)
                    ? 'border-accent-solid bg-accent-bg text-accent-text dark:bg-accent-darkBg dark:text-accent-darkText'
                    : 'border-neutral-border text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'
                }`}
              >
                {s.nombre}
              </button>
            ))}
          </div>
          {sedes.length === 0 && (
            <Banner tone="warning">Todavía no hay ninguna sede configurada.</Banner>
          )}
          {sedesError && <Banner tone="danger">{sedesError}</Banner>}
        </div>
      </Modal>
    </div>
  )
}
