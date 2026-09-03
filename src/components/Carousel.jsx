import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Carrusel genérico con flechas laterales y autoplay opcional.
 * `children` debe ser un arreglo de nodos, uno por slide.
 */
export default function Carousel({
  children,
  autoPlay = false,
  interval = 5000,
  slidesToShowClassName = 'basis-full',
  className = '',
  ariaLabel = 'Carrusel',
}) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const count = children.length

  const scrollToIndex = useCallback(
    (i) => {
      const track = trackRef.current
      if (!track) return
      const clamped = (i + count) % count
      const child = track.children[clamped]
      if (child) {
        track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: 'smooth' })
      }
      setIndex(clamped)
    },
    [count],
  )

  useEffect(() => {
    if (!autoPlay || count <= 1) return undefined
    const id = setInterval(() => {
      scrollToIndex(index + 1)
    }, interval)
    return () => clearInterval(id)
  }, [autoPlay, interval, index, scrollToIndex, count])

  return (
    <div className={`relative ${className}`} role="region" aria-label={ariaLabel}>
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
      >
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${slidesToShowClassName}`}>
            {child}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scrollToIndex(index - 1)}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 rounded-full bg-white text-icr-navy shadow-card p-2 md:p-3 hover:bg-icr-mint transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => scrollToIndex(index + 1)}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full bg-white text-icr-navy shadow-card p-2 md:p-3 hover:bg-icr-mint transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {children.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-icr-cyan' : 'w-2 bg-icr-navy/20'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
