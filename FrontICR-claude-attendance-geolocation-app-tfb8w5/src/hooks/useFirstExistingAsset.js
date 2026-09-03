import { useEffect, useState } from 'react'

const DEFAULT_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

// Prueba `${basePath}.jpg`, `.jpeg`, `.png`, `.webp` en orden y devuelve la
// primera que exista, o null si ninguna carga. Útil para slots como
// backgroundMain/backgroundNosotros donde no sabemos de antemano en qué
// formato se copiará el archivo.
export default function useFirstExistingAsset(basePath, extensions = DEFAULT_EXTENSIONS) {
  const [src, setSrc] = useState(null)
  const extKey = extensions.join(',')

  useEffect(() => {
    let cancelled = false

    function tryIndex(i) {
      if (i >= extensions.length) {
        if (!cancelled) setSrc(null)
        return
      }
      const candidate = `${basePath}.${extensions[i]}`
      const img = new Image()
      img.onload = () => {
        if (!cancelled) setSrc(candidate)
      }
      img.onerror = () => tryIndex(i + 1)
      img.src = candidate
    }

    if (basePath) tryIndex(0)
    else setSrc(null)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, extKey])

  return src
}
