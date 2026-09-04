import { useEffect, useState } from 'react'
import { Building2, Save, Plus } from 'lucide-react'
import { getSedes, createSede, updateSede } from '../api/resources.js'
import { PageHeader, Card, Input, Button, Banner, EmptyState } from '../components/ui.jsx'

const emptyNewSede = { nombre: '', latitud: '', longitud: '', radio_metros: 100 }

export default function Sedes() {
  const [sedes, setSedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [successId, setSuccessId] = useState(null)
  const [newSede, setNewSede] = useState(emptyNewSede)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSedes()
      setSedes(data || [])
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las sedes')
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
        nombre: sede.nombre,
        latitud: Number(sede.latitud),
        longitud: Number(sede.longitud),
        radioMetros: Number(sede.radio_metros),
      })
      setSuccessId(sede.id)
    } catch (err) {
      setError(err.message || 'No se pudo guardar la sede')
    } finally {
      setSavingId(null)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreateError(null)
    if (!newSede.nombre.trim() || newSede.latitud === '' || newSede.longitud === '') {
      setCreateError('Nombre, latitud y longitud son requeridos')
      return
    }
    setCreating(true)
    try {
      await createSede({
        nombre: newSede.nombre.trim(),
        latitud: Number(newSede.latitud),
        longitud: Number(newSede.longitud),
        radioMetros: Number(newSede.radio_metros) || 100,
      })
      setNewSede(emptyNewSede)
      await load()
    } catch (err) {
      setCreateError(err.message || 'No se pudo crear la sede')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Sedes"
        description="Define la ubicación y el radio permitido para marcar asistencia"
      />

      {error && (
        <div className="mb-4">
          <Banner tone="danger">{error}</Banner>
        </div>
      )}

      <Card className="mb-4">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Plus size={18} />
            <span className="text-sm font-medium">Nueva sede</span>
          </div>
          <Input
            label="Nombre"
            value={newSede.nombre}
            onChange={(e) => setNewSede((s) => ({ ...s, nombre: e.target.value }))}
            required
          />
          <Banner tone="accent">
            Ingresa las coordenadas exactas de la sede. Puedes obtenerlas abriendo el punto en Google Maps
            y copiando la latitud y longitud que aparecen en la URL.
          </Banner>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Latitud"
              type="number"
              step="any"
              value={newSede.latitud}
              onChange={(e) => setNewSede((s) => ({ ...s, latitud: e.target.value }))}
              required
            />
            <Input
              label="Longitud"
              type="number"
              step="any"
              value={newSede.longitud}
              onChange={(e) => setNewSede((s) => ({ ...s, longitud: e.target.value }))}
              required
            />
            <Input
              label="Radio permitido (metros)"
              type="number"
              min="0"
              value={newSede.radio_metros}
              onChange={(e) => setNewSede((s) => ({ ...s, radio_metros: e.target.value }))}
            />
          </div>
          {createError && <Banner tone="danger">{createError}</Banner>}
          <div className="flex justify-end">
            <Button type="submit" disabled={creating}>
              <Plus size={16} />
              {creating ? 'Creando…' : 'Crear sede'}
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <Card className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">Cargando…</Card>
      ) : sedes.length === 0 ? (
        <EmptyState icon={Building2} message="Todavía no hay sedes creadas" />
      ) : (
        <div className="flex flex-col gap-4">
          {sedes.map((sede) => (
            <Card key={sede.id}>
              <div className="mb-4 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Building2 size={18} />
                <span className="text-sm font-medium">{sede.nombre || `Sede #${sede.id}`}</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Nombre"
                  value={sede.nombre ?? ''}
                  onChange={(e) => update(sede.id, 'nombre', e.target.value)}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Latitud"
                  type="number"
                  step="any"
                  value={sede.latitud ?? ''}
                  onChange={(e) => update(sede.id, 'latitud', e.target.value)}
                />
                <Input
                  label="Longitud"
                  type="number"
                  step="any"
                  value={sede.longitud ?? ''}
                  onChange={(e) => update(sede.id, 'longitud', e.target.value)}
                />
                <Input
                  label="Radio permitido (metros)"
                  type="number"
                  min="0"
                  value={sede.radio_metros ?? ''}
                  onChange={(e) => update(sede.id, 'radio_metros', e.target.value)}
                />
              </div>

              {successId === sede.id && (
                <div className="mt-4">
                  <Banner tone="success">Sede actualizada correctamente</Banner>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button onClick={() => handleSave(sede)} disabled={savingId === sede.id}>
                  <Save size={16} />
                  {savingId === sede.id ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
