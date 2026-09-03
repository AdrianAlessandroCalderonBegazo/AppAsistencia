import { useId } from 'react'
import { SectorIcon } from '../icons/SectorIcons'

// Ilustración genérica de respaldo para proyectos/secciones sin fotografía
// real todavía. Pensada para ser reemplazada 1:1 por las imágenes que se
// vayan proporcionando (misma proporción, mismo contenedor).
const GRADIENTS = {
  mina: 'from-[#00004c] via-[#000073] to-[#00b7c2]',
  industria: 'from-[#000073] via-[#00004c] to-[#00b7c2]',
  agricultura: 'from-[#00004c] via-[#00707a] to-[#00ffc2]',
  textil: 'from-[#000073] via-[#004d55] to-[#00b7c2]',
  energia: 'from-[#00004c] via-[#00b7c2] to-[#00ffc2]',
  default: 'from-[#00004c] via-[#000073] to-[#00b7c2]',
}

export default function SceneIllustration({ sector = 'default', className = '', label }) {
  const gradient = GRADIENTS[sector] || GRADIENTS.default
  const gridId = `grid-${sector}-${useId()}`
  // Tailwind's `relative` and `absolute` utilities carry equal specificity, so
  // when a caller passes `absolute` (to pin this as a full-bleed hero layer)
  // it must fully replace the default `relative`, not just sit alongside it.
  const positionClass = className.includes('absolute') ? '' : 'relative'

  return (
    <div className={`${positionClass} overflow-hidden bg-gradient-to-br ${gradient} ${className}`.trim()}>
      <svg className="absolute inset-0 h-full w-full opacity-20" preserveAspectRatio="none">
        <defs>
          <pattern id={gridId} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />
      </svg>
      <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-icr-mint/20 blur-2xl" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90">
        <SectorIcon id={sector} className="h-14 w-14 md:h-20 md:w-20" />
      </div>
      {label && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  )
}
