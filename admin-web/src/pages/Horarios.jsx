import { useEffect, useState } from 'react'
import { Clock, Save } from 'lucide-react'
import { getEmpleados, getHorarios, createHorario, updateHorario } from '../api/resources.js'
import { PageHeader, Card, Select, Input, Button, Banner } from '../components/ui.jsx'
import { DIAS, DIAS_LABORALES_DEFAULT } from '../utils/dias.js'

const emptyHorario = {
  id: null,
  horaEntrada: '08:00',
  horaSalida: '17:00',
  duracionAlmuerzoMinutos: 60,
  toleranciaMinutos: 10,
  diasSemana: DIAS_LABORALES_DEFAULT,
}

// "08:00:00" (TIME de Postgres) -> "08:00" (lo que espera <input type="time">)
function toInputTime(value, fallback) {
  return value ? value.slice(0, 5) : fallback
}

export default function Horarios() {
  const [empleados, setEmpleados] = useState([])
  const [empleadoId, setEmpleadoId] = useState('')
  const [horario, setHorario] = useState(emptyHorario)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    async function loadEmpleados() {
      setLoading(true)
      try {
        const data = await getEmpleados()
        const list = (data || []).filter((e) => e.estado === 'activo')
        setEmpleados(list)
        if (list[0]) setEmpleadoId(String(list[0].id))
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los empleados')
      } finally {
        setLoading(false)
      }
    }
    loadEmpleados()
  }, [])

  useEffect(() => {
    if (!empleadoId) return
    let active = true
    async function loadHorario() {
      setError(null)
      setSuccess(null)
      try {
        const list = await getHorarios(empleadoId)
        const existing = (list || []).find((h) => h.activo) || list?.[0]
        if (!active) return
        if (existing) {
          setHorario({
            id: existing.id,
            horaEntrada: toInputTime(existing.hora_entrada, '08:00'),
            horaSalida: toInputTime(existing.hora_salida, '17:00'),
            duracionAlmuerzoMinutos: existing.duracion_almuerzo_minutos ?? 60,
            toleranciaMinutos: existing.tolerancia_minutos ?? 10,
            diasSemana: existing.dias_semana || [],
          })
        } else {
          setHorario(emptyHorario)
        }
      } catch (err) {
        if (active) setError(err.message || 'No se pudo cargar el horario')
      }
    }
    loadHorario()
    return () => {
      active = false
    }
  }, [empleadoId])

  function update(field, value) {
    setHorario((h) => ({ ...h, [field]: value }))
  }

  function toggleDia(dia) {
    setHorario((h) => ({
      ...h,
      diasSemana: h.diasSemana.includes(dia) ? h.diasSemana.filter((d) => d !== dia) : [...h.diasSemana, dia],
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        empleadoId: Number(empleadoId),
        horaEntrada: horario.horaEntrada,
        horaSalida: horario.horaSalida,
        duracionAlmuerzoMinutos: Number(horario.duracionAlmuerzoMinutos) || null,
        toleranciaMinutos: Number(horario.toleranciaMinutos) || 0,
        diasSemana: horario.diasSemana,
      }
      if (horario.id) {
        await updateHorario(horario.id, payload)
      } else {
        const created = await createHorario(payload)
        if (created?.id) update('id', created.id)
      }
      setSuccess('Horario guardado correctamente')
    } catch (err) {
      setError(err.message || 'No se pudo guardar el horario')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Horarios" description="Define el horario de trabajo por empleado" />

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
        <Select
          label="Empleado"
          value={empleadoId}
          onChange={(e) => setEmpleadoId(e.target.value)}
          disabled={loading}
        >
          {empleados.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre} · {e.dni}
            </option>
          ))}
        </Select>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <Clock size={18} />
          <span className="text-sm font-medium">Jornada laboral</span>
        </div>

        <div className="mb-5">
          <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Días laborales</span>
          <div className="flex flex-wrap gap-2">
            {DIAS.map((d) => (
              <button
                type="button"
                key={d.value}
                onClick={() => toggleDia(d.value)}
                className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                  horario.diasSemana.includes(d.value)
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
            value={horario.horaEntrada}
            onChange={(e) => update('horaEntrada', e.target.value)}
          />
          <Input
            label="Hora de salida"
            type="time"
            value={horario.horaSalida}
            onChange={(e) => update('horaSalida', e.target.value)}
          />
          <Input
            label="Duración de almuerzo (minutos)"
            type="number"
            min="0"
            step="5"
            value={horario.duracionAlmuerzoMinutos}
            onChange={(e) => update('duracionAlmuerzoMinutos', e.target.value)}
            hint="Se puede tomar en cualquier momento de la jornada, no a una hora fija"
          />
          <Input
            label="Tolerancia (minutos)"
            type="number"
            min="0"
            value={horario.toleranciaMinutos}
            onChange={(e) => update('toleranciaMinutos', e.target.value)}
            hint="Minutos de gracia antes de marcar entrada tardía, salida anticipada o almuerzo excedido"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving || !empleadoId}>
            <Save size={16} />
            {saving ? 'Guardando…' : 'Guardar horario'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
