import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, mustChangePassword } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (mustChangePassword) return <Navigate to="/cambiar-password" replace />

  return children
}
