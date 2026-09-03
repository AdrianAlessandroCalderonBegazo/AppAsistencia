import { useMemo, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import ProjectCard from '../components/ProjectCard'
import { projects, sectors } from '../data/content'

export default function Experiencia() {
  const [filter, setFilter] = useState('todos')

  const filtered = useMemo(
    () => (filter === 'todos' ? projects : projects.filter((p) => p.sector === filter)),
    [filter],
  )

  return (
    <div>
      <section className="bg-icr-gradient py-16 text-white md:py-24">
        <div className="container-icr text-center">
          <span className="section-eyebrow text-icr-mint">Experiencia</span>
          <h1 className="mt-4 font-black text-3xl md:text-5xl">Nuestra cartera de proyectos</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Proyectos energéticos ejecutados en minería, industria, textil y energía a lo largo del Perú.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container-icr">
          <SectionHeading eyebrow="Proyectos" title="Filtra por sector" align="left" />

          <div className="mb-10 flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('todos')}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                filter === 'todos' ? 'bg-icr-navy text-white' : 'bg-icr-navy/5 text-icr-navy hover:bg-icr-navy/10'
              }`}
            >
              Todos
            </button>
            {sectors.map((s) => (
              <button
                key={s.id}
                onClick={() => setFilter(s.id)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                  filter === s.id ? 'bg-icr-navy text-white' : 'bg-icr-navy/5 text-icr-navy hover:bg-icr-navy/10'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
