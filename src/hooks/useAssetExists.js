import { useEffect, useState } from 'react'

// Comprueba si una imagen en /public existe y termina de cargar, para poder
// mostrar el archivo real en cuanto se copie a su ruta y mientras tanto
// usar un respaldo dibujado a mano, sin tener que tocar código.
export default function useAssetExists(src) {
  const [exists, setExists] = useState(false)

  useEffect(() => {
    if (!src) {
      setExists(false)
      return undefined
    }
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setExists(true)
    }
    img.onerror = () => {
      if (!cancelled) setExists(false)
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  return exists
}
