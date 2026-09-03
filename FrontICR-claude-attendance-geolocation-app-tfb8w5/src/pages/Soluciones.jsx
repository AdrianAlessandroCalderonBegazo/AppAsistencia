import { Link } from 'react-router-dom'
import WhatsAppButton from '../components/WhatsAppButton'

export default function Soluciones() {
  return (
    <div className="bg-icr-gradient">
      <section className="container-icr flex min-h-[70vh] flex-col items-center justify-center py-24 text-center text-white">
        <span className="section-eyebrow text-icr-mint">Soluciones</span>
        <h1 className="mt-4 max-w-2xl font-black text-3xl md:text-5xl">
          Estamos preparando el detalle de nuestras soluciones
        </h1>
        <p className="mt-6 max-w-xl text-white/80">
          Estamos actualizando esta sección con el detalle completo de nuestras soluciones energéticas.
          Mientras tanto, cuéntanos tu necesidad y un especialista te orientará directamente.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/contacto"
            className="rounded-full bg-white px-7 py-3 font-bold text-icr-navy transition-transform hover:scale-105"
          >
            Hablar con un especialista
          </Link>
          <WhatsAppButton variant="outline" />
        </div>
      </section>
    </div>
  )
}
