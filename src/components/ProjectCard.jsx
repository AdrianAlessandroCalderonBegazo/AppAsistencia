import { Link } from 'react-router-dom'
import ProjectImage from './ProjectImage'
import { sectors } from '../data/content'

export default function ProjectCard({ project }) {
  const sector = sectors.find((s) => s.id === project.sector)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-icr-navy/10 bg-white shadow-sm transition-shadow hover:shadow-card">
      <ProjectImage
        project={project}
        label={sector?.name}
        className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-icr-cyan">{project.location}</p>
        <h3 className="mt-1 font-bold text-lg text-icr-navy">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-icr-navy/70">{project.summary}</p>
        <Link
          to={`/experiencia/${project.id}`}
          className="mt-4 inline-flex items-center gap-1 font-bold text-icr-navy hover:text-icr-cyan"
        >
          Leer más
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
