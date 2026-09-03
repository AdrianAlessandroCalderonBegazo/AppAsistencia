import { useEffect, useState } from 'react'
import { Clock, Save } from 'lucide-react'
import { getEmpleados, getHorarios, createHorario, updateHorario } from '../api/resources.js'
import { PageHeader, Card, Select, Input, Button, Banner } from '../components/ui.jsx'

const DIAS = [
  { key: 'lunes', label: 'lunes' },
  { key: 'martes', label: 'martes' },
  { key: 'miercoles', label: 'miércoles' },
  { key: 'jueves', label: 'jueves' },
  { key: 'viernes', label: 'viernes' },
  { key: 'sabado', label: 'sábado' },
  { key: 'domingo', label: 'domingo' },
]

const emptyHorario = {
  id: null,
  entrada: '08:00',
  salida: '17:00',
  almuerzo_inicio: '13:00',
  almuerzo_fin: '14:00',
  tolerancia_minutos: 10,
  dias: [],
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
        const data = await getEmpleados({ activo: true })
        const list = Array.isArray(data) ? data : data?.data || []
        setEmpleados(list)
        if (list[0]) setEmpleadoId(String(list[0].id))
      } catch (err) {
        setError(err.message || 'no se pudieron cargar los empleados')
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
        const data = await getHorarios(empleadoId)
        const list = Array.isArray(data) ? data : data?.data || (data ? [data] : [])
        const existing = list[0]
        if (!active) return
        if (existing) {
          setHorario({
            id: existing.id,
            entrada: existing.entrada || existing.hora_entrada || '08:00',
            salida: existing.salida || existing.hora_salida || '17:00',
            almuerzo_inicio: existing.almuerzo_inicio || '13:00',
            almuerzo_fin: existing.almuerzo_fin || '14:00',
            tolerancia_minutos: existing.tolerancia_minutos ?? 10,
            dias: existing.dias || [],
          })
        } else {
          setHorario(emptyHorario)
        }
      } catch (err) {
        if (active) setError(err.message || 'no se pudo cargar el horario')
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
      dias: h.dias.includes(dia) ? h.dias.filter((d) => d !== dia) : [...h.dias, dia],
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        empleado_id: empleadoId,
        entrada: horario.entrada,
        salida: horario.salida,
        almuerzo_inicio: horario.almuerzo_inicio,
        almuerzo_fin: horario.almuerzo_fin,
        tolerancia_minutos: Number(horario.tolerancia_minutos) || 0,
        dias: horario.dias,
      }
      if (horario.id) {
        await updateHorario(horario.id, payload)
      } else {
        const created = await createHorario(payload)
        if (created?.id) update('id', created.id)
      }
      setSuccess('horario guardado correctamente')
    } catch (err) {
      setError(err.message || 'no se pudo guardar el horario')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="horarios" description="define el horario de trabajo por empleado" />

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
          label="empleado"
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
          <span className="text-sm font-medium">jornada laboral</span>
        </div>

        <div className="mb-5">
          <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">días laborales</span>
          <div className="flex flex-wrap gap-2">
            {DIAS.map((d) => (
              <button
                type="button"
                key={d.key}
                onClick={() => toggleDia(d.key)}
                className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                  horario.dias.includes(d.key)
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
            value={horario.entrada}
            onChange={(e) => update('entrada', e.target.value)}
          />
          <Input
            label="hora de salida"
            type="time"
            value={horario.salida}
            onChange={(e) => update('salida', e.target.value)}
          />
          <Input
            label="inicio de almuerzo"
            type="time"
            value={horario.almuerzo_inicio}
            onChange={(e) => update('almuerzo_inicio', e.target.value)}
          />
          <Input
            label="fin de almuerzo"
            type="time"
            value={horario.almuerzo_fin}
            onChange={(e) => update('almuerzo_fin', e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Input
            label="tolerancia (minutos)"
            type="number"
            min="0"
            value={horario.tolerancia_minutos}
            onChange={(e) => update('tolerancia_minutos', e.target.value)}
            hint="minutos de gracia antes de marcar una llegada como tarde"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving || !empleadoId}>
            <Save size={16} />
            {saving ? 'guardando…' : 'guardar horario'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
