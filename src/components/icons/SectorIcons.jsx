// Iconos de sector — ilustraciones propias en estilo lineal, usadas como
// respaldo mientras no existan los archivos svgrepo reales. En cuanto se
// copien a public/icons/sectors/ con el nombre indicado en SECTOR_ICON_FILES,
// SectorIcon los detecta automáticamente y los usa en su lugar (ver abajo).

import useAssetExists from '../../hooks/useAssetExists'

export function MinaIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 6c-3 4-5 8-5 12a5 5 0 0010 0c0-4-2-8-5-12z" fill="currentColor" opacity="0.85" />
      <path d="M8 40l10-16 6 9 4-6 12 13H8z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M4 40h40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function IndustriaIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M6 40V22l10 7v-7l10 7v-7l10 7V16h6v24H6z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M32 16V8h4v4h4v4" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <circle cx="14" cy="30" r="2" fill="currentColor" />
      <path d="M4 40h40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function AgriculturaIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="12" r="5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 17v13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 40c0-8 3.5-13 8-15 4.5 2 8 7 8 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M12 30c4-1 6 1 6 4M36 30c-4-1-6 1-6 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4 40h40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function TextilIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <ellipse cx="24" cy="24" rx="16" ry="9" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M8 24c4 4 10 6.5 16 6.5S36 28 40 24M8 24c4-4 10-6.5 16-6.5S36 20 40 24"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  )
}

export function EnergiaIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="14" r="7" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 3v3M24 22v3M35 14h3M10 14h3M32.5 6.5l-2 2M17.5 21.5l-2 2M32.5 21.5l-2-2M17.5 6.5l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="30" width="32" height="12" rx="1.5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 36h32M16 30v12M24 30v12M32 30v12" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
    </svg>
  )
}

export const sectorIconMap = {
  mina: MinaIcon,
  industria: IndustriaIcon,
  agricultura: AgriculturaIcon,
  textil: TextilIcon,
  energia: EnergiaIcon,
}

// Copiar cada archivo tal cual (mismo nombre) a public/icons/sectors/.
export const SECTOR_ICON_FILES = {
  mina: 'mining-svgrepo-com.svg',
  industria: 'factory-industry-construction-svgrepo-com.svg',
  agricultura: 'farmer-human-svgrepo-com.svg',
  textil: 'wool-svgrepo-com.svg',
  energia: 'energy-panel-solar-sun-svgrepo-com.svg',
}

export function SectorIcon({ id, className = 'w-10 h-10' }) {
  const file = SECTOR_ICON_FILES[id]
  const src = file ? `/icons/sectors/${file}` : null
  const hasRealIcon = useAssetExists(src)
  const Fallback = sectorIconMap[id] || EnergiaIcon

  if (hasRealIcon) {
    // Técnica de máscara: el svg real se recorta con el color actual
    // (currentColor), así se ve blanco/navy igual que los iconos propios
    // sin importar los colores originales del archivo svgrepo.
    return (
      <span
        role="img"
        aria-label={id}
        className={className}
        style={{
          display: 'inline-block',
          backgroundColor: 'currentColor',
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
    )
  }

  return <Fallback className={className} />
}
