import { Link, useParams } from 'react-router-dom'
import ProjectImage from '../components/ProjectImage'
import WhatsAppButton from '../components/WhatsAppButton'
import { projects, sectors } from '../data/content'

export default function ProyectoDetalle() {
  const { id } = useParams()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="container-icr flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="font-black text-2xl text-icr-navy">Proyecto no encontrado</h1>
        <Link to="/experiencia" className="font-bold text-icr-cyan">
          Volver a experiencia
        </Link>
      </div>
    )
  }

  const sector = sectors.find((s) => s.id === project.sector)
  const related = projects.filter((p) => p.sector === project.sector && p.id !== project.id).slice(0, 3)

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-icr-navy text-white">
        <ProjectImage project={project} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-icr-navy via-icr-navy/70 to-icr-navy/30" />
        <div className="container-icr relative z-10 py-20 md:py-28">
          <Link to="/experiencia" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver a experiencia
          </Link>
          <span className="section-eyebrow mt-6 block text-icr-mint">{sector?.name}</span>
          <h1 className="mt-3 max-w-3xl font-black text-3xl md:text-5xl">{project.title}</h1>
          <p className="mt-3 text-white/80">{project.location}</p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container-icr grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <ProjectImage project={project} index={0} className="col-span-2 aspect-[16/9] w-full rounded-2xl" />
              <ProjectImage project={project} index={1} className="aspect-[4/3] w-full rounded-2xl" />
              <ProjectImage project={project} index={2} className="aspect-[4/3] w-full rounded-2xl" />
            </div>

            <h2 className="mt-10 font-black text-2xl text-icr-navy">Sobre el proyecto</h2>
            <p className="mt-4 leading-relaxed text-icr-navy/70">{project.description}</p>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-icr-navy/10 p-6">
              <h3 className="font-bold text-icr-navy">Cifras del proyecto</h3>
              <dl className="mt-4 space-y-3">
                {project.stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between border-b border-icr-navy/5 pb-2">
                    <dt className="text-sm text-icr-navy/60">{stat.label}</dt>
                    <dd className="font-bold text-icr-navy">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl bg-icr-gradient p-6 text-white">
              <h3 className="font-bold">¿Tienes un proyecto similar?</h3>
              <p className="mt-2 text-sm text-white/80">
                Conversemos sobre cómo llevar continuidad energética a tu operación.
              </p>
              <WhatsAppButton className="mt-4 w-full justify-center" />
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="container-icr mt-16 border-t border-icr-navy/10 pt-16">
            <h2 className="font-black text-2xl text-icr-navy">Otros proyectos en {sector?.name.toLowerCase()}</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/experiencia/${r.id}`}
                  className="group overflow-hidden rounded-2xl border border-icr-navy/10"
                >
                  <ProjectImage project={r} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />
                  <div className="p-5">
                    <h3 className="font-bold text-icr-navy">{r.title}</h3>
                    <p className="mt-1 text-sm text-icr-navy/60">{r.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
