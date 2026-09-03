import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { Button, Input, Banner } from '../components/ui.jsx'

export default function Login() {
  const { login, isAuthenticated, mustChangePassword } = useAuth()
  const navigate = useNavigate()
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated && mustChangePassword) return <Navigate to="/cambiar-password" replace />
  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(dni.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'no se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-bg/40 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-border bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-bg text-accent-text dark:bg-accent-darkBg dark:text-accent-darkText">
            <LogIn size={22} />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">panel de administración</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">control de asistencia y geolocalización</p>
        </div>

        {error && (
          <div className="mb-4">
            <Banner tone="danger">{error}</Banner>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="dni"
            placeholder="12345678"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'ingresando…' : 'ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
