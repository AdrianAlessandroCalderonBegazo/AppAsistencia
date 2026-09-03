import SceneIllustration from './illustrations/SceneIllustration'

/**
 * Muestra la foto real de un proyecto (project.images[index]) si existe;
 * si no, cae a la ilustración genérica del sector. Mismo className en
 * ambos casos para que el layout no cambie según haya foto o no.
 */
export default function ProjectImage({ project, index = 0, className = '', label }) {
  const src = project?.images?.[index]

  if (!src) {
    return <SceneIllustration sector={project?.sector} className={className} label={label} />
  }

  // Same fix as SceneIllustration: `relative` and `absolute` share
  // specificity in Tailwind's generated CSS, so only add `relative` when
  // the caller hasn't already asked for `absolute` positioning.
  const positionClass = className.includes('absolute') ? '' : 'relative'

  return (
    <div className={`${positionClass} overflow-hidden ${className}`.trim()}>
      <img src={src} alt={project.title} className="h-full w-full object-cover" loading="lazy" />
      {label && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  )
}
