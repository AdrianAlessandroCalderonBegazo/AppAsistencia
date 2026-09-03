import { useEffect, useState } from 'react'
import { Check, X, MessageSquare } from 'lucide-react'
import { getSolicitudes, resolveSolicitud } from '../api/resources.js'
import { PageHeader, Card, Select, Button, Textarea, Banner, EmptyState } from '../components/ui.jsx'
import StatusPill from '../components/StatusPill.jsx'
import Modal from '../components/Modal.jsx'

export default function Solicitudes() {
  const [estadoFilter, setEstadoFilter] = useState('pendiente')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [action, setAction] = useState(null) // { item, decision: 'aprobada' | 'rechazada' }
  const [respuesta, setRespuesta] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSolicitudes(estadoFilter ? { estado: estadoFilter } : {})
      setItems(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      setError(err.message || 'no se pudieron cargar las solicitudes')
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
    setRespuesta('')
    setSaveError(null)
  }

  async function confirmAction() {
    setSaving(true)
    setSaveError(null)
    try {
      await resolveSolicitud(action.item.id, action.decision, respuesta.trim())
      setAction(null)
      await load()
    } catch (err) {
      setSaveError(err.message || 'no se pudo procesar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="solicitudes de corrección"
        description="revisa y responde las correcciones solicitadas por los empleados"
      />

      {error && (
        <div className="mb-4">
          <Banner tone="danger">{error}</Banner>
        </div>
      )}

      <Card className="mb-4">
        <div className="max-w-xs">
          <Select label="estado" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
            <option value="">todas</option>
            <option value="pendiente">pendiente</option>
            <option value="aprobada">aprobada</option>
            <option value="rechazada">rechazada</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">cargando…</Card>
      ) : items.length === 0 ? (
        <EmptyState icon={MessageSquare} />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.empleado_nombre || item.empleado?.nombre || 'empleado'} · {item.fecha}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{item.mensaje || item.motivo}</p>
                </div>
                <StatusPill status={item.estado || 'pendiente'} />
              </div>

              {item.respuesta && (
                <div className="rounded-xl bg-neutral-bg px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  respuesta: {item.respuesta}
                </div>
              )}

              {(!item.estado || item.estado === 'pendiente') && (
                <div className="flex justify-end gap-2">
                  <Button variant="danger" onClick={() => openAction(item, 'rechazada')} className="px-3 py-1.5 text-xs">
                    <X size={14} />
                    rechazar
                  </Button>
                  <Button variant="success" onClick={() => openAction(item, 'aprobada')} className="px-3 py-1.5 text-xs">
                    <Check size={14} />
                    aprobar solicitud
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
        title={action?.decision === 'aprobada' ? 'aprobar solicitud' : 'rechazar solicitud'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAction(null)}>
              cancelar
            </Button>
            <Button
              variant={action?.decision === 'aprobada' ? 'success' : 'danger'}
              onClick={confirmAction}
              disabled={saving}
            >
              {saving ? 'procesando…' : action?.decision === 'aprobada' ? 'confirmar aprobación' : 'confirmar rechazo'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p>
            {action?.decision === 'aprobada'
              ? 'al aprobar, se generará o corregirá la marca de asistencia correspondiente.'
              : 'al rechazar, la marca de asistencia no se modificará.'}
          </p>
          <Textarea
            label="mensaje de respuesta (opcional)"
            placeholder="explica brevemente la decisión al empleado"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            rows={3}
          />
          {saveError && <Banner tone="danger">{saveError}</Banner>}
        </div>
      </Modal>
    </div>
  )
}
