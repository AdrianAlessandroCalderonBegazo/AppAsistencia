import { Link } from 'react-router-dom'
import Carousel from '../components/Carousel'
import SectionHeading from '../components/SectionHeading'
import ProjectImage from '../components/ProjectImage'
import HeroBackground from '../components/HeroBackground'
import PeruMap from '../components/PeruMap'
import WhatsAppButton from '../components/WhatsAppButton'
import { SectorIcon } from '../components/icons/SectorIcons'
import { brand, sectors, hitos } from '../data/content'

export default function Home() {
  return (
    <div>
      {/* Copiar la foto a public/images/backgroundMain.(jpg|jpeg|png|webp) para reemplazar el fondo */}
      <section className="relative isolate overflow-hidden bg-icr-navy">
        <HeroBackground slot="backgroundMain" sector="energia" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-icr-navy via-icr-navy/70 to-icr-navy/40" />
        <div className="container-icr relative z-10 flex min-h-[80vh] flex-col justify-center py-24 text-white">
          <span className="section-eyebrow text-icr-mint">Inversiones ICR</span>
          <h1 className="mt-4 max-w-3xl font-black text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            Energía confiable.
            <br />
            Soluciones inteligentes.
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/80 md:text-lg">{brand.promise}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/soluciones"
              className="rounded-full bg-icr-mint px-7 py-3 font-bold text-icr-navy transition-transform hover:scale-105"
            >
              Ver soluciones
            </Link>
            <WhatsAppButton variant="outline" label="Escríbenos" />
          </div>
        </div>
      </section>

      {/* Nuestro propósito */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-icr grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="section-eyebrow">Nuestro propósito</span>
            <p className="mt-4 font-black text-2xl leading-snug text-icr-navy sm:text-3xl md:text-4xl">
              “{brand.purpose}”
            </p>
            <p className="mt-6 text-icr-navy/70">{brand.brandContext}</p>
          </div>

          <div className="rounded-3xl bg-icr-navy p-6 md:p-8">
            <p className="mb-4 text-center font-bold text-white">Presentes en todo el Sur del Perú</p>
            <PeruMap className="mx-auto h-auto w-full max-w-sm" />
          </div>
        </div>
      </section>

      {/* Nuestros hitos */}
      <section className="bg-[#f5f8fb] py-20 md:py-28" id="hitos">
        <div className="container-icr">
          <SectionHeading
            eyebrow="Nuestros hitos"
            title="Proyectos que marcan nuestra trayectoria"
            description="Una selección de los proyectos más representativos que hemos ejecutado a lo largo del Perú, desde minería hasta desarrollo social."
          />
          <Carousel
            ariaLabel="Hitos de Inversiones ICR"
            autoPlay
            interval={5500}
            slidesToShowClassName="basis-full sm:basis-1/2 lg:basis-1/3"
          >
            {hitos.map((project) => (
              <article
                key={project.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-icr-navy/10 bg-white shadow-sm"
              >
                <ProjectImage project={project} className="aspect-[16/10] w-full" />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-icr-cyan">{project.location}</p>
                  <h3 className="mt-1 font-bold text-lg text-icr-navy">{project.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-icr-navy/70">{project.summary}</p>
                  <Link
                    to={`/experiencia/${project.id}`}
                    className="mt-4 font-bold text-icr-navy hover:text-icr-cyan"
                  >
                    Ver proyecto →
                  </Link>
                </div>
              </article>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Sectores */}
      <section className="bg-white py-20 md:py-28" id="sectores">
        <div className="container-icr">
          <SectionHeading
            eyebrow="Sectores"
            title="Soluciones energéticas para cada industria"
            description="Diseñamos e implementamos sistemas adaptados a las exigencias de cada sector."
          />
          <Carousel
            ariaLabel="Sectores atendidos"
            slidesToShowClassName="basis-1/2 sm:basis-1/3 lg:basis-1/5"
          >
            {sectors.map((sector) => (
              <Link
                key={sector.id}
                to={`/sectores#${sector.id}`}
                className="group flex h-full flex-col items-center gap-4 rounded-2xl border border-icr-navy/10 p-6 text-center transition-colors hover:border-icr-cyan hover:bg-icr-navy/[0.03]"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-icr-navy text-white transition-colors group-hover:bg-icr-cyan">
                  <SectorIcon id={sector.id} className="h-8 w-8" />
                </span>
                <span className="font-bold text-icr-navy">{sector.name}</span>
              </Link>
            ))}
          </Carousel>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-icr-gradient py-16 text-white">
        <div className="container-icr flex flex-col items-center gap-6 text-center">
          <h2 className="font-black text-2xl md:text-3xl max-w-2xl">
            ¿Listo para llevar continuidad energética a tu operación?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contacto"
              className="rounded-full bg-white px-7 py-3 font-bold text-icr-navy transition-transform hover:scale-105"
            >
              Hablar con un especialista
            </Link>
            <WhatsAppButton variant="outline" />
          </div>
        </div>
      </section>
    </div>
  )
}
