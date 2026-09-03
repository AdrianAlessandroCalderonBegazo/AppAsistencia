import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { createEmpleado } from '../api/resources.js'
import { PageHeader, Card, Input, Select, Button, Banner } from '../components/ui.jsx'

const DIAS = [
  { key: 'lunes', label: 'lun' },
  { key: 'martes', label: 'mar' },
  { key: 'miercoles', label: 'mié' },
  { key: 'jueves', label: 'jue' },
  { key: 'viernes', label: 'vie' },
  { key: 'sabado', label: 'sáb' },
  { key: 'domingo', label: 'dom' },
]

const initialForm = {
  dni: '',
  nombre: '',
  sede_id: '',
  entrada: '08:00',
  salida: '17:00',
  almuerzo_inicio: '13:00',
  almuerzo_fin: '14:00',
  tolerancia_minutos: 10,
  dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
}

export default function EmpleadoAlta() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleDia(dia) {
    setForm((f) => ({
      ...f,
      dias: f.dias.includes(dia) ? f.dias.filter((d) => d !== dia) : [...f.dias, dia],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      await createEmpleado({
        dni: form.dni.trim(),
        nombre: form.nombre.trim(),
        sede_id: form.sede_id || undefined,
        horario: {
          entrada: form.entrada,
          salida: form.salida,
          almuerzo_inicio: form.almuerzo_inicio,
          almuerzo_fin: form.almuerzo_fin,
          tolerancia_minutos: Number(form.tolerancia_minutos) || 0,
          dias: form.dias,
        },
      })
      setSuccess(true)
      setForm(initialForm)
    } catch (err) {
      setError(err.message || 'no se pudo crear el empleado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="alta de empleado"
        description="registra un nuevo empleado con su horario inicial"
      />

      {success && (
        <div className="mb-4">
          <Banner tone="success">empleado creado correctamente</Banner>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Banner tone="danger">{error}</Banner>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <UserPlus size={18} />
            <span className="text-sm font-medium">datos personales</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="dni"
              value={form.dni}
              onChange={(e) => update('dni', e.target.value)}
              required
            />
            <Input
              label="nombre completo"
              value={form.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              required
            />
          </div>
          <Input
            label="id de sede"
            hint="id numérico de la sede a la que pertenece (ver sección sedes)"
            value={form.sede_id}
            onChange={(e) => update('sede_id', e.target.value)}
          />

          <hr className="border-neutral-border dark:border-zinc-800" />

          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">horario inicial</div>

          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">días laborales</span>
            <div className="flex flex-wrap gap-2">
              {DIAS.map((d) => (
                <button
                  type="button"
                  key={d.key}
                  onClick={() => toggleDia(d.key)}
                  className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                    form.dias.includes(d.key)
                      ? 'border-accent-solid bg-accent-bg text-accent-text dark:bg-accent-darkBg dark:text-accent-darkText'
                      : 'border-neutral-border text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="hora de entrada"
              type="time"
              value={form.entrada}
              onChange={(e) => update('entrada', e.target.value)}
              required
            />
            <Input
              label="hora de salida"
              type="time"
              value={form.salida}
              onChange={(e) => update('salida', e.target.value)}
              required
            />
            <Input
              label="inicio de almuerzo"
              type="time"
              value={form.almuerzo_inicio}
              onChange={(e) => update('almuerzo_inicio', e.target.value)}
            />
            <Input
              label="fin de almuerzo"
              type="time"
              value={form.almuerzo_fin}
              onChange={(e) => update('almuerzo_fin', e.target.value)}
            />
          </div>

          <Input
            label="tolerancia (minutos)"
            type="number"
            min="0"
            value={form.tolerancia_minutos}
            onChange={(e) => update('tolerancia_minutos', e.target.value)}
            hint="minutos de gracia antes de marcar una llegada como tarde"
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'guardando…' : 'crear empleado'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
