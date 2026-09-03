import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { Button, Input, Banner } from '../components/ui.jsx'

export default function ChangePassword() {
  const { isAuthenticated, mustChangePassword, changePassword } = useAuth()
  const navigate = useNavigate()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!mustChangePassword) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (nueva !== confirmar) {
      setError('las contraseñas nuevas no coinciden')
      return
    }
    if (nueva.length < 6) {
      setError('la contraseña nueva debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      await changePassword(actual, nueva)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'no se pudo cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-bg/40 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-border bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-bg text-warning-text dark:bg-warning-darkBg dark:text-warning-darkText">
            <KeyRound size={22} />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">cambia tu contraseña</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            por seguridad necesitas definir una contraseña nueva antes de continuar
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Banner tone="danger">{error}</Banner>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="contraseña actual"
            type="password"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            required
          />
          <Input
            label="contraseña nueva"
            type="password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required
          />
          <Input
            label="confirmar contraseña nueva"
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'guardando…' : 'guardar contraseña'}
          </Button>
        </form>
      </div>
    </div>
  )
}
