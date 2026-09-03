import { Link } from 'react-router-dom'
import { brand, contact, featuredProjects } from '../data/content'

function IconWrap({ children }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-icr-cyan">
      {children}
    </span>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-icr-navy text-white/80">
      <div className="container-icr grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-bold text-xl text-white">
            Inversiones <span className="text-icr-cyan">ICR</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed">{brand.tagline}</p>

          <div className="mt-5 space-y-2 text-sm">
            <a href={`tel:${contact.phoneWhatsapp}`} className="flex items-center gap-2 hover:text-icr-mint">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              {contact.phoneDisplay}
            </a>
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-icr-mint">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4z" />
                <path d="M4 6l8 7 8-7" />
              </svg>
              {contact.email}
            </a>
            <p className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {contact.address}
            </p>
          </div>

          <div className="mt-5 flex gap-3">
            <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <IconWrap>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M22 12a10 10 0 10-11.5 9.87v-6.98H7.9V12h2.6V9.8c0-2.56 1.53-4 3.87-4 1.12 0 2.29.2 2.29.2v2.5h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.86l-.46 2.89h-2.4v6.98A10 10 0 0022 12z" />
                </svg>
              </IconWrap>
            </a>
            <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IconWrap>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </IconWrap>
            </a>
          </div>
        </div>

        <div>
          <p className="font-bold text-white mb-3">Nosotros</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/nosotros" className="hover:text-icr-mint">Historia</Link>
            </li>
            <li>
              <Link to="/nosotros#hitos" className="hover:text-icr-mint">Hitos</Link>
            </li>
            <li>
              <Link to="/nosotros#valores" className="hover:text-icr-mint">Nuestros valores</Link>
            </li>
          </ul>

          <p className="font-bold text-white mt-6 mb-3">Experiencia</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/experiencia" className="hover:text-icr-mint">Cartera de proyectos</Link>
            </li>
          </ul>

          <p className="font-bold text-white mt-6 mb-3">Soluciones</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/soluciones" className="hover:text-icr-mint">Ver soluciones</Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <p className="font-bold text-white mb-3">Proyectos destacados</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {featuredProjects.map((p) => (
              <li key={p.id}>
                <Link to={`/experiencia/${p.id}`} className="hover:text-icr-mint">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-icr flex flex-col md:flex-row items-center justify-between gap-2 py-5 text-xs text-white/50">
          <p>© {year} Inversiones ICR. Todos los derechos reservados.</p>
          <p>{brand.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
