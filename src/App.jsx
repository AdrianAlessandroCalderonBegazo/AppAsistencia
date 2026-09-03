import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Nosotros from './pages/Nosotros'
import Sectores from './pages/Sectores'
import Soluciones from './pages/Soluciones'
import Experiencia from './pages/Experiencia'
import ProyectoDetalle from './pages/ProyectoDetalle'
import Contacto from './pages/Contacto'

function NotFound() {
  return (
    <div className="container-icr flex min-h-[50vh] flex-col items-center justify-center gap-3 py-24 text-center">
      <h1 className="font-black text-3xl text-icr-navy">404</h1>
      <p className="text-icr-navy/70">La página que buscas no existe.</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="sectores" element={<Sectores />} />
        <Route path="soluciones" element={<Soluciones />} />
        <Route path="experiencia" element={<Experiencia />} />
        <Route path="experiencia/:id" element={<ProyectoDetalle />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
