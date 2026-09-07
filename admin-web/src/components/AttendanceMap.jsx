import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// El paquete de leaflet apunta sus iconos por defecto a rutas relativas que Vite no resuelve;
// hay que registrar las URLs ya procesadas por el bundler a mano, una sola vez.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

/// Muestra dónde se registró una marca de asistencia, y de fondo el área permitida de cada
/// sede asignada al empleado (círculo con su radio), para comparar visualmente qué tan lejos
/// quedó — útil sobre todo para marcas fuera de área o de empleados que trabajan en campo.
export default function AttendanceMap({ lat, lng, sites = [] }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const map = L.map(containerRef.current).setView([lat, lng], 15)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.marker([lat, lng]).addTo(map).bindPopup('Marca registrada aquí').openPopup()

    for (const site of sites) {
      L.circle([site.latitud, site.longitud], {
        radius: site.radio_metros,
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.1,
      })
        .addTo(map)
        .bindPopup(`Área permitida: ${site.nombre}`)
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className="h-80 w-full rounded-xl" />
}
