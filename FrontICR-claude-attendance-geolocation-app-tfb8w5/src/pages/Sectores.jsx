import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Carousel from '../components/Carousel'
import SectionHeading from '../components/SectionHeading'
import ProjectImage from '../components/ProjectImage'
import WhatsAppButton from '../components/WhatsAppButton'
import FAQAccordion from '../components/FAQAccordion'
import { SectorIcon } from '../components/icons/SectorIcons'
import { sectors, projectsBySector, agricultureGeneric, featuredProjects, faqs } from '../data/content'

export default function Sectores() {
  const { hash } = useLocation()
  const [activeSector, setActiveSector] = useState(sectors[0].id)

  useEffect(() => {
    const id = hash?.replace('#', '')
    if (id && sectors.some((s) => s.id === id)) {
      setActiveSector(id)
    }
  }, [hash])

  const sector = sectors.find((s) => s.id === activeSector)
  const sectorProjects = projectsBySector(activeSector)
  const isGenericSector = sectorProjects.length === 0

  return (
    <div>
      <section className="bg-icr-gradient py-16 text-white md:py-24">
        <div className="container-icr text-center">
          <span className="section-eyebrow text-icr-mint">Sectores</span>
          <h1 className="mt-4 font-black text-3xl md:text-5xl">Soluciones por industria</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Selecciona un sector para conocer los proyectos que hemos desarrollado en él.
          </p>
        </div>
      </section>

      {/* Carrusel de sectores */}
      <section className="bg-white py-14">
        <div className="container-icr">
          <Carousel ariaLabel="Selector de sectores" slidesToShowClassName="basis-1/2 sm:basis-1/3 lg:basis-1/5">
            {sectors.map((s) => (
              <button
                key={s.id}
                id={s.id}
                onClick={() => setActiveSector(s.id)}
                className={`flex h-full w-full flex-col items-center gap-4 rounded-2xl border p-6 text-center transition-colors ${
                  activeSector === s.id
                    ? 'border-icr-cyan bg-icr-navy/[0.04]'
                    : 'border-icr-navy/10 hover:border-icr-cyan'
                }`}
              >
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-white transition-colors ${
                    activeSector === s.id ? 'bg-icr-cyan' : 'bg-icr-navy'
                  }`}
                >
                  <SectorIcon id={s.id} className="h-8 w-8" />
                </span>
                <span className="font-bold text-icr-navy">{s.name}</span>
              </button>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Proyectos del sector activo */}
      <section className="bg-[#f5f8fb] py-16 md:py-20">
        <div className="container-icr">
          <SectionHeading
            eyebrow={sector.name}
            title={`Proyectos en el sector ${sector.name.toLowerCase()}`}
            description={sector.description}
          />

          {isGenericSector ? (
            <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-icr-navy/10 bg-white p-6 md:grid-cols-2 md:p-10">
              <img
                src={agricultureGeneric.image}
                alt={agricultureGeneric.title}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <div>
                <span className="rounded-full bg-icr-cyan/10 px-3 py-1 text-xs font-bold text-icr-cyan">
                  Imagen referencial
                </span>
                <h3 className="mt-3 font-bold text-xl text-icr-navy">{agricultureGeneric.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-icr-navy/70">{agricultureGeneric.description}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {sectorProjects.map((project) => (
                <div
                  key={project.id}
                  className="grid grid-cols-1 overflow-hidden rounded-2xl border border-icr-navy/10 bg-white sm:grid-cols-2"
                >
                  <ProjectImage project={project} className="aspect-[4/3] w-full sm:h-full" />
                  <div className="flex flex-col p-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-icr-cyan">{project.location}</p>
                    <h3 className="mt-1 font-bold text-lg text-icr-navy">{project.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-icr-navy/70">{project.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Casos de éxito */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-icr">
          <SectionHeading
            eyebrow="Casos de éxito"
            title="Resultados que respaldan nuestra experiencia"
            description="Proyectos ejecutados de principio a fin, con resultados medibles para nuestros clientes."
          />
          <Carousel ariaLabel="Casos de éxito" autoPlay interval={6000} slidesToShowClassName="basis-full md:basis-1/2">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="grid grid-cols-1 overflow-hidden rounded-2xl border border-icr-navy/10 bg-white shadow-sm sm:grid-cols-2"
              >
                <ProjectImage project={project} className="aspect-[4/3] w-full sm:h-full" />
                <div className="flex flex-col justify-center p-6">
                  <h3 className="font-bold text-lg text-icr-navy">{project.title}</h3>
                  <p className="mt-2 text-sm text-icr-navy/70">{project.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {project.stats.slice(0, 2).map((stat) => (
                      <span key={stat.label} className="rounded-full bg-icr-navy/5 px-3 py-1 text-xs font-bold text-icr-navy">
                        {stat.value} · {stat.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#f5f8fb] py-16 md:py-24" id="preguntas">
        <div className="container-icr max-w-3xl">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Resolvemos tus dudas sobre nuestras soluciones"
          />
          <FAQAccordion items={faqs} />

          <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl bg-icr-navy p-8 text-center text-white">
            <h3 className="font-black text-xl md:text-2xl">¿Tienes más preguntas?</h3>
            <p className="text-white/80">Escríbenos y un especialista te ayudará a encontrar la solución adecuada.</p>
            <WhatsAppButton />
          </div>
        </div>
      </section>
    </div>
  )
}
