import { useState } from 'react'
import WhatsAppButton from '../components/WhatsAppButton'
import { contact, whatsappLink } from '../data/content'

const HEARD_OPTIONS = [
  'Redes sociales',
  'Recomendación de un cliente',
  'Búsqueda en internet',
  'Publicidad',
  'Evento o feria',
  'Otro',
]

// Los nombres reales de las soluciones están pendientes de definición
// (ver página "Soluciones"); se muestran como opciones genéricas 1-4.
const SOLUTION_OPTIONS = ['Solución 1', 'Solución 2', 'Solución 3', 'Solución 4']

const initialForm = {
  nombre: '',
  correo: '',
  celular: '',
  comoTeEnteraste: '',
  solucion: '',
}

export default function Contacto() {
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const message = [
      'Hola, quiero información sobre soluciones energéticas de Inversiones ICR.',
      `Nombre completo: ${form.nombre}`,
      `Correo: ${form.correo}`,
      `Celular: ${form.celular}`,
      `¿Cómo se enteró de nosotros?: ${form.comoTeEnteraste || '—'}`,
      `Solución de interés: ${form.solucion || '—'}`,
    ].join('\n')

    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer')
    setSent(true)
    setForm(initialForm)
  }

  return (
    <div>
      <section className="bg-icr-gradient py-16 text-white md:py-24">
        <div className="container-icr text-center">
          <span className="section-eyebrow text-icr-mint">Contacto</span>
          <h1 className="mt-4 font-black text-3xl md:text-5xl">Hablemos de tu proyecto energético</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Déjanos tus datos y un especialista de Inversiones ICR se pondrá en contacto contigo.
          </p>
          <div className="mt-8 flex justify-center">
            <WhatsAppButton variant="outline" label="Escríbenos directo por WhatsApp" />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container-icr grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-icr-navy/10 p-6 md:p-10">
            <h2 className="font-black text-2xl text-icr-navy">Déjanos tus datos</h2>
            <p className="mt-2 text-sm text-icr-navy/60">
              Completa el formulario y te contactaremos a la brevedad. También puedes enviarnos tus datos
              directamente por WhatsApp.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-bold text-icr-navy">Nombre completo</span>
                <input
                  required
                  type="text"
                  value={form.nombre}
                  onChange={update('nombre')}
                  placeholder="Ej. María Pérez"
                  className="rounded-xl border border-icr-navy/15 px-4 py-3 outline-none focus:border-icr-cyan"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-icr-navy">Correo electrónico</span>
                <input
                  required
                  type="email"
                  value={form.correo}
                  onChange={update('correo')}
                  placeholder="nombre@correo.com"
                  className="rounded-xl border border-icr-navy/15 px-4 py-3 outline-none focus:border-icr-cyan"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-icr-navy">Celular</span>
                <input
                  required
                  type="tel"
                  value={form.celular}
                  onChange={update('celular')}
                  placeholder="9XX XXX XXX"
                  className="rounded-xl border border-icr-navy/15 px-4 py-3 outline-none focus:border-icr-cyan"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-icr-navy">¿Cómo te enteraste de nosotros?</span>
                <select
                  required
                  value={form.comoTeEnteraste}
                  onChange={update('comoTeEnteraste')}
                  className="rounded-xl border border-icr-navy/15 px-4 py-3 outline-none focus:border-icr-cyan"
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  {HEARD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-icr-navy">¿Qué solución te interesa?</span>
                <select
                  required
                  value={form.solucion}
                  onChange={update('solucion')}
                  className="rounded-xl border border-icr-navy/15 px-4 py-3 outline-none focus:border-icr-cyan"
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  {SOLUTION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="mt-8 w-full rounded-full bg-icr-navy py-3.5 font-bold text-white transition-colors hover:bg-icr-blue sm:w-auto sm:px-10"
            >
              Enviar
            </button>

            {sent && (
              <p className="mt-4 text-sm font-medium text-icr-cyan">
                ¡Gracias! Se abrió WhatsApp con tus datos para que confirmes el envío.
              </p>
            )}
          </form>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-icr-navy p-8 text-white">
              <h3 className="font-bold text-lg">Información de contacto</h3>
              <div className="mt-5 space-y-4 text-sm">
                <a href={`tel:${contact.phoneWhatsapp}`} className="flex items-center gap-3 hover:text-icr-mint">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  {contact.phoneDisplay}
                </a>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-icr-mint">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16v16H4z" />
                    <path d="M4 6l8 7 8-7" />
                  </svg>
                  {contact.email}
                </a>
                <p className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {contact.address}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-icr-navy/10 p-8">
              <h3 className="font-bold text-lg text-icr-navy">Horario de atención</h3>
              <p className="mt-3 text-sm text-icr-navy/70">Lunes a viernes: 9:00 a.m. – 6:00 p.m.</p>
              <p className="text-sm text-icr-navy/70">Sábados: 9:00 a.m. – 1:00 p.m.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
