import { useEffect, useState } from 'react'
import { Check, X, MessageSquare } from 'lucide-react'
import { getSolicitudes, approveSolicitud, rejectSolicitud, getEmpleados, getSedes } from '../api/resources.js'
import { PageHeader, Card, Select, Input, Button, Textarea, Banner, EmptyState } from '../components/ui.jsx'
import StatusPill from '../components/StatusPill.jsx'
import Modal from '../components/Modal.jsx'

const TIPO_LABEL = {
  entrada: 'Entrada',
  salida_almuerzo: 'Salida a almuerzo',
  regreso_almuerzo: 'Regreso de almuerzo',
  salida: 'Salida final',
}

export default function Solicitudes() {
  const [estadoFilter, setEstadoFilter] = useState('pendiente')
  const [items, setItems] = useState([])
  const [siteByEmployee, setSiteByEmployee] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [action, setAction] = useState(null) // { item, decision: 'aprobada' | 'rechazada' }
  const [horaMarcada, setHoraMarcada] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    async function loadSitios() {
      try {
        const [empleados, sedes] = await Promise.all([getEmpleados(), getSedes()])
        const sedeById = new Map((sedes || []).map((s) => [s.id, s]))
        const map = new Map()
        for (const emp of empleados || []) {
          const site = sedeById.get(emp.sede_id)
          if (site) map.set(emp.id, site)
        }
        setSiteByEmployee(map)
      } catch {
        // si falla, igual se puede rechazar solicitudes; solo aprobar requerirá reintentar
      }
    }
    loadSitios()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSolicitudes(estadoFilter || undefined)
      setItems(data || [])
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoFilter])

  function openAction(item, decision) {
    setAction({ item, decision })
    setHoraMarcada(`${item.fecha}T${item.hora_solicitada ? item.hora_solicitada.slice(0, 5) : '08:00'}`)
    setRespuesta('')
    setSaveError(null)
  }

  async function confirmAction() {
    setSaving(true)
    setSaveError(null)
    try {
      if (action.decision === 'aprobada') {
        const site = siteByEmployee.get(action.item.empleado_id)
        if (!site) {
          setSaveError('No se encontró la sede del empleado; recarga la página e intenta de nuevo')
          setSaving(false)
          return
        }
        await approveSolicitud(action.item.id, {
          lat: site.latitud,
          lng: site.longitud,
          horaMarcada: new Date(horaMarcada).toISOString(),
        })
      } else {
        if (!respuesta.trim()) {
          setSaveError('El motivo de rechazo es obligatorio')
          setSaving(false)
          return
        }
        await rejectSolicitud(action.item.id, respuesta.trim())
      }
      setAction(null)
      await load()
    } catch (err) {
      setSaveError(err.message || 'No se pudo procesar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Solicitudes de corrección"
        description="Revisa y responde las correcciones solicitadas por los empleados"
      />

      {error && (
        <div className="mb-4">
          <Banner tone="danger">{error}</Banner>
        </div>
      )}

      <Card className="mb-4">
        <div className="max-w-xs">
          <Select label="Estado" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
            <option value="">Todas</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">Cargando…</Card>
      ) : items.length === 0 ? (
        <EmptyState icon={MessageSquare} />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.empleado_nombre} · {item.fecha} · {TIPO_LABEL[item.tipo_marca] || item.tipo_marca}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{item.mensaje_empleado}</p>
                </div>
                <StatusPill status={item.estado} />
              </div>

              {item.respuesta_admin && (
                <div className="rounded-xl bg-neutral-bg px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  Respuesta: {item.respuesta_admin}
                </div>
              )}

              {item.estado === 'pendiente' && (
                <div className="flex justify-end gap-2">
                  <Button variant="danger" onClick={() => openAction(item, 'rechazada')} className="px-3 py-1.5 text-xs">
                    <X size={14} />
                    Rechazar
                  </Button>
                  <Button variant="success" onClick={() => openAction(item, 'aprobada')} className="px-3 py-1.5 text-xs">
                    <Check size={14} />
                    Aprobar solicitud
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!action}
        onClose={() => setAction(null)}
        title={action?.decision === 'aprobada' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAction(null)}>
              Cancelar
            </Button>
            <Button
              variant={action?.decision === 'aprobada' ? 'success' : 'danger'}
              onClick={confirmAction}
              disabled={saving}
            >
              {saving ? 'Procesando…' : action?.decision === 'aprobada' ? 'Confirmar aprobación' : 'Confirmar rechazo'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {action?.decision === 'aprobada' ? (
            <>
              <p>Se creará la marca de asistencia correspondiente, registrada en la ubicación de la sede del empleado.</p>
              <Input
                label="Fecha y hora de la marca"
                type="datetime-local"
                value={horaMarcada}
                onChange={(e) => setHoraMarcada(e.target.value)}
              />
              <Textarea
                label="Mensaje de respuesta (opcional)"
                placeholder="Explica brevemente la decisión al empleado"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={3}
              />
            </>
          ) : (
            <>
              <p>Al rechazar, la marca de asistencia no se modificará.</p>
              <Textarea
                label="Motivo del rechazo (obligatorio)"
                placeholder="Explica brevemente por qué se rechaza"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={3}
                required
              />
            </>
          )}
          {saveError && <Banner tone="danger">{saveError}</Banner>}
        </div>
      </Modal>
    </div>
  )
}
