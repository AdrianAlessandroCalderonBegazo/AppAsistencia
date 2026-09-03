import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import EmpleadoAlta from './pages/EmpleadoAlta.jsx'
import EmpleadoBaja from './pages/EmpleadoBaja.jsx'
import Horarios from './pages/Horarios.jsx'
import Asistencias from './pages/Asistencias.jsx'
import Solicitudes from './pages/Solicitudes.jsx'
import Reportes from './pages/Reportes.jsx'
import Sedes from './pages/Sedes.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cambiar-password" element={<ChangePassword />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/empleados/alta" element={<EmpleadoAlta />} />
        <Route path="/empleados/baja" element={<EmpleadoBaja />} />
        <Route path="/horarios" element={<Horarios />} />
        <Route path="/asistencias" element={<Asistencias />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/sedes" element={<Sedes />} />
      </Route>
    </Routes>
  )
}
