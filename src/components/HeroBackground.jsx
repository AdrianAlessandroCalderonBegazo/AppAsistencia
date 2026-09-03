import SceneIllustration from './illustrations/SceneIllustration'
import useFirstExistingAsset from '../hooks/useFirstExistingAsset'

/**
 * Fondo de hero que usa /public/images/<slot>.(jpg|jpeg|png|webp) en cuanto
 * exista, y mientras tanto cae a la ilustración genérica del sector.
 * Pensado para los slots backgroundMain (Home) y backgroundNosotros (Nosotros).
 */
export default function HeroBackground({ slot, sector = 'energia', className = '' }) {
  const src = useFirstExistingAsset(`/images/${slot}`)

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`object-cover ${className}`}
      />
    )
  }

  return <SceneIllustration sector={sector} className={className} />
}
