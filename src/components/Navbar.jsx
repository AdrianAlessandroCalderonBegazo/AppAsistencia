import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navLinks } from '../data/content'

function Logo() {
  return (
    <Link to="/" className="flex items-center shrink-0" aria-label="Inversiones ICR — Inicio">
      <img src="/HorizontalICR.png" alt="Inversiones ICR" className="w-60 h-auto" />         
    </Link>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [sectoresOpen, setSectoresOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setSectoresOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-shadow ${
        scrolled ? 'bg-white/95 backdrop-blur shadow-md' : 'bg-white'
      }`}
    >
      <nav className="container-icr flex h-16 md:h-20 items-center justify-between">
        <Logo />

        <ul className="hidden lg:flex items-center gap-8 font-medium text-icr-navy">
          {navLinks.map((link) =>
            link.children ? (
              <li
                key={link.label}
                className="relative"
                onMouseEnter={() => setSectoresOpen(true)}
                onMouseLeave={() => setSectoresOpen(false)}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1 py-2 hover:text-icr-cyan transition-colors ${
                      isActive ? 'text-icr-cyan' : ''
                    }`
                  }
                >
                  {link.label}
                  <svg viewBox="0 0 12 8" className="h-2.5 w-2.5 mt-0.5" fill="none">
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </NavLink>
                {sectoresOpen && (
                  <ul className="absolute left-1/2 top-full w-56 -translate-x-1/2 rounded-xl border border-icr-navy/10 bg-white p-2 shadow-card">
                    {link.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          to={child.to}
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-icr-navy/5 hover:text-icr-cyan"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={link.label}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `py-2 hover:text-icr-cyan transition-colors ${isActive ? 'text-icr-cyan' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ),
          )}
        </ul>

        <Link
          to="/contacto"
          className="hidden lg:inline-flex rounded-full bg-icr-navy px-5 py-2.5 font-bold text-white transition-colors hover:bg-icr-blue"
        >
          Cotiza tu proyecto
        </Link>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden text-icr-navy p-2"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-icr-navy/10 bg-white">
          <ul className="container-icr flex flex-col py-3 font-medium text-icr-navy">
            {navLinks.map((link) => (
              <li key={link.label} className="border-b border-icr-navy/5 py-1">
                <Link to={link.to} className="block py-2">
                  {link.label}
                </Link>
                {link.children && (
                  <ul className="pb-2 pl-4">
                    {link.children.map((child) => (
                      <li key={child.label}>
                        <Link to={child.to} className="block py-1.5 text-sm text-icr-navy/70">
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="pt-3">
              <Link
                to="/contacto"
                className="block rounded-full bg-icr-navy px-5 py-2.5 text-center font-bold text-white"
              >
                Cotiza tu proyecto
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
