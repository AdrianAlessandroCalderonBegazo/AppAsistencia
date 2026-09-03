import { useState } from 'react'
import SceneIllustration from './illustrations/SceneIllustration'

/**
 * Reproduce un video en loop y solo lo muestra cuando ya tiene un frame
 * real cargado; mientras tanto (o si el archivo no existe) se ve la
 * ilustración de respaldo del sector, nunca un recuadro roto.
 */
export default function VideoWithFallback({ src, className = '', sector = 'energia' }) {
  const [ready, setReady] = useState(false)
  const positionClass = className.includes('absolute') ? '' : 'relative'

  return (
    <div className={`${positionClass} overflow-hidden ${className}`.trim()}>
      {!ready && <SceneIllustration sector={sector} className="absolute inset-0 h-full w-full" />}
      <video
        className={`h-full w-full object-cover transition-opacity duration-700 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setReady(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
