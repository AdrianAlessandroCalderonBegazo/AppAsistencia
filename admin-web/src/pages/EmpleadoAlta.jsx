import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Building2 } from 'lucide-react'
import { createEmpleado, getSedes } from '../api/resources.js'
import { PageHeader, Card, Input, Button, Banner } from '../components/ui.jsx'
import { DIAS, DIAS_LABORALES_DEFAULT } from '../utils/dias.js'

const initialForm = {
  dni: '',
  nombre: '',
  sedeIds: [],
  horaEntrada: '08:00',
  horaSalida: '17:00',
  horaInicioAlmuerzo: '13:00',
  horaFinAlmuerzo: '14:00',
  toleranciaMinutos: 10,
  diasSemana: DIAS_LABORALES_DEFAULT,
}

// misma regla que backend/src/utils/genericPassword.js — solo para mostrarle al admin
// qué contraseña le toca comunicar al empleado (el backend nunca la devuelve en texto plano).
function genericPasswordFor(dni) {
  const digits = String(dni).replace(/\D/g, '').padEnd(4, '0').slice(0, 4)
  return `${digits}Asis`
}

export default function EmpleadoAlta() {
  const navigate = useNavigate()
  const [sedes, setSedes] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [createdInfo, setCreatedInfo] = useState(null)

  useEffect(() => {
    getSedes()
      .then((data) => {
        setSedes(data || [])
        if (data?.[0]) update('sedeIds', [data[0].id])
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleDia(dia) {
    setForm((f) => ({
      ...f,
      diasSemana: f.diasSemana.includes(dia) ? f.diasSemana.filter((d) => d !== dia) : [...f.diasSemana, dia],
    }))
  }

  function toggleSede(sedeId) {
    setForm((f) => ({
      ...f,
      sedeIds: f.sedeIds.includes(sedeId) ? f.sedeIds.filter((id) => id !== sedeId) : [...f.sedeIds, sedeId],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCreatedInfo(null)
    if (form.sedeIds.length === 0) {
      setError('Selecciona al menos una sede')
      return
    }
    setLoading(true)
    try {
      const dni = form.dni.trim()
      await createEmpleado({
        dni,
        nombre: form.nombre.trim(),
        sedeIds: form.sedeIds,
        horarioInicial: {
          horaEntrada: form.horaEntrada,
          horaSalida: form.horaSalida,
          horaInicioAlmuerzo: form.horaInicioAlmuerzo || null,
          horaFinAlmuerzo: form.horaFinAlmuerzo || null,
          toleranciaMinutos: Number(form.toleranciaMinutos) || 0,
          diasSemana: form.diasSemana,
        },
      })
      setCreatedInfo({ dni, nombre: form.nombre.trim(), password: genericPasswordFor(dni) })
      setForm({ ...initialForm, sedeIds: form.sedeIds })
    } catch (err) {
      setError(err.message || 'No se pudo crear el empleado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Alta de empleado"
        description="Registra un nuevo empleado con su horario inicial"
      />

      {createdInfo && (
        <div className="mb-4">
          <Banner tone="success">
            {createdInfo.nombre || createdInfo.dni} fue creado correctamente. Contraseña genérica asignada:{' '}
            <strong>{createdInfo.password}</strong> — el empleado deberá cambiarla al ingresar por primera vez.
          </Banner>
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
            <span className="text-sm font-medium">Datos personales</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="DNI"
              value={form.dni}
              onChange={(e) => update('dni', e.target.value)}
              required
            />
            <Input
              label="Nombre completo"
              value={form.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Building2 size={16} />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Sedes donde puede marcar
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sedes.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSede(s.id)}
                  className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                    form.sedeIds.includes(s.id)
                      ? 'border-accent-solid bg-accent-bg text-accent-text dark:bg-accent-darkBg dark:text-accent-darkText'
                      : 'border-neutral-border text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {s.nombre}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Si elige más de una, podrá marcar en cualquiera de ellas indistintamente (útil si rota entre
              locales o cambia de sede a mitad de jornada).
            </p>
          </div>
          {sedes.length === 0 && (
            <Banner tone="warning">
              Todavía no hay ninguna sede configurada — crea una primero en la sección "Sedes".
            </Banner>
          )}

          <hr className="border-neutral-border dark:border-zinc-800" />

          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Horario inicial</div>

          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Días laborales</span>
            <div className="flex flex-wrap gap-2">
              {DIAS.map((d) => (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => toggleDia(d.value)}
                  className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                    form.diasSemana.includes(d.value)
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
              label="Hora de entrada"
              type="time"
              value={form.horaEntrada}
              onChange={(e) => update('horaEntrada', e.target.value)}
              required
            />
            <Input
              label="Hora de salida"
              type="time"
              value={form.horaSalida}
              onChange={(e) => update('horaSalida', e.target.value)}
              required
            />
            <Input
              label="Inicio de almuerzo"
              type="time"
              value={form.horaInicioAlmuerzo}
              onChange={(e) => update('horaInicioAlmuerzo', e.target.value)}
            />
            <Input
              label="Fin de almuerzo"
              type="time"
              value={form.horaFinAlmuerzo}
              onChange={(e) => update('horaFinAlmuerzo', e.target.value)}
            />
          </div>

          <Input
            label="Tolerancia (minutos)"
            type="number"
            min="0"
            value={form.toleranciaMinutos}
            onChange={(e) => update('toleranciaMinutos', e.target.value)}
            hint="Minutos de gracia antes de marcar una llegada como tarde"
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando…' : 'Crear empleado'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
