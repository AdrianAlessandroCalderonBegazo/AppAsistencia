import { useEffect, useState } from 'react'
import { Building2, Save } from 'lucide-react'
import { getSedes, updateSede } from '../api/resources.js'
import { PageHeader, Card, Input, Button, Banner, EmptyState } from '../components/ui.jsx'

export default function Sedes() {
  const [sedes, setSedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [successId, setSuccessId] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSedes()
      setSedes(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      setError(err.message || 'no se pudieron cargar las sedes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function update(id, field, value) {
    setSedes((list) => list.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  async function handleSave(sede) {
    setSavingId(sede.id)
    setError(null)
    setSuccessId(null)
    try {
      await updateSede(sede.id, {
        latitud: Number(sede.latitud),
        longitud: Number(sede.longitud),
        radio_metros: Number(sede.radio_metros),
      })
      setSuccessId(sede.id)
    } catch (err) {
      setError(err.message || 'no se pudo guardar la sede')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="configuración de sede"
        description="define la ubicación y el radio permitido para marcar asistencia"
      />

      {error && (
        <div className="mb-4">
          <Banner tone="danger">{error}</Banner>
        </div>
      )}

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">cargando…</Card>
      ) : sedes.length === 0 ? (
        <EmptyState icon={Building2} />
      ) : (
        <div className="flex flex-col gap-4">
          {sedes.map((sede) => (
            <Card key={sede.id}>
              <div className="mb-4 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Building2 size={18} />
                <span className="text-sm font-medium">{sede.nombre || `sede #${sede.id}`}</span>
              </div>

              <Banner tone="accent">
                ingresa las coordenadas exactas de la sede. puedes obtenerlas abriendo el punto en google maps
                y copiando la latitud y longitud que aparecen en la url.
              </Banner>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="latitud"
                  type="number"
                  step="any"
                  value={sede.latitud ?? ''}
                  onChange={(e) => update(sede.id, 'latitud', e.target.value)}
                />
                <Input
                  label="longitud"
                  type="number"
                  step="any"
                  value={sede.longitud ?? ''}
                  onChange={(e) => update(sede.id, 'longitud', e.target.value)}
                />
                <Input
                  label="radio permitido (metros)"
                  type="number"
                  min="0"
                  value={sede.radio_metros ?? ''}
                  onChange={(e) => update(sede.id, 'radio_metros', e.target.value)}
                />
              </div>

              {successId === sede.id && (
                <div className="mt-4">
                  <Banner tone="success">sede actualizada correctamente</Banner>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button onClick={() => handleSave(sede)} disabled={savingId === sede.id}>
                  <Save size={16} />
                  {savingId === sede.id ? 'guardando…' : 'guardar cambios'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
