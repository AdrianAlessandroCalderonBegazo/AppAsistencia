import useAssetExists from '../hooks/useAssetExists'

// Hay un archivo real en public/icons/maps/Perú.svg, pero su encaje
// (aspect ratio y posición de pines) todavía no está calibrado con esta
// silueta, así que de momento se sigue usando la silueta de abajo, que ya
// viene de la frontera real del Perú (GeoJSON de la frontera nacional)
// proyectada a este viewBox con corrección de latitud.
const PERU_SVG_SRC = encodeURI('/maps/Perú.svg')

const VIEW_W = 400
const VIEW_H = 470

// Coordenadas proyectadas a partir de la frontera real del Perú (ver
// silueta más abajo) y de las coordenadas geográficas de cada ciudad.
const PINS = [
  { id: 'tacna', label: 'Tacna', x: 309.3, y: 438.3, labelSide: 'left' },
  { id: 'tacna', label: 'Puno', x: 320.3, y: 380.3, labelSide: 'left' },
  { id: 'tacna', label: 'Cuzco', x: 290.3, y: 336.3, labelSide: 'left' },
  { id: 'arequipa', label: 'Arequipa', x: 280.0, y: 401.3, labelSide: 'left' },
  { id: 'moquegua', label: 'Moquegua', x: 293.8, y: 419.4, labelSide: 'left' },
  { id: 'ayacucho', label: 'Ayacucho', x: 221.0, y: 361.6 },
  { id: 'madre-de-dios', label: 'Pto. Maldonado', x: 333.7, y: 313.2, labelSide: 'left' },
]

function PinMarker({ pin, showLabels }) {
  const left = (pin.x / VIEW_W) * 100
  const top = (pin.y / VIEW_H) * 100
  const alignEnd = pin.labelSide === 'left'

  return (
    <>
      <span
        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-icr-mint ring-2 ring-icr-navy"
        style={{ left: `${left}%`, top: `${top}%` }}
      />
      <span
        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-icr-cyan opacity-60"
        style={{ left: `${left}%`, top: `${top}%` }}
      />
      {showLabels && (
        <span
          className="absolute -translate-y-1/2 whitespace-nowrap rounded bg-icr-navy/80 px-1.5 py-0.5 text-[11px] font-medium text-white"
          style={{
            top: `${top}%`,
            ...(alignEnd ? { right: `calc(${100 - left}% + 10px)` } : { left: `calc(${left}% + 10px)` }),
          }}
        >
          {pin.label}
        </span>
      )}
    </>
  )
}

export default function PeruMap({ className = 'w-full h-auto', showLabels = true }) {
  const hasRealMap = useAssetExists(PERU_SVG_SRC)

  if (hasRealMap) {
    return (
      <div className={`relative ${className}`} style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <img src={PERU_SVG_SRC} alt="Mapa del Perú" className="absolute inset-0 h-full w-full object-contain" />
        {PINS.map((pin) => (
          <PinMarker key={pin.id} pin={pin} showLabels={showLabels} />
        ))}
      </div>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      role="img"
      aria-label="Mapa del Perú con presencia de proyectos ICR"
    >
      <path
        d="M 324.5 428.3 L 318.4 440.1 L 306.6 446.0 L 283.7 432.8 L 281.7 423.3 L 236.4 400.1 L 195.4 374.9 L 177.8 360.7 L 168.3 341.6 L 172.1 335.0 L 152.7 304.7 L 130.2 262.1 L 108.6 216.2 L 99.3 205.7 L 92.1 188.7 L 74.3 173.6 L 58.0 164.3 L 65.4 154.0 L 54.4 132.0 L 61.5 115.8 L 79.7 101.2 L 82.4 110.8 L 75.9 116.3 L 76.5 124.8 L 86.0 123.0 L 95.2 125.4 L 104.8 137.1 L 117.7 127.6 L 122.0 112.0 L 136.0 92.0 L 163.5 82.9 L 188.4 58.7 L 195.5 43.7 L 192.3 26.2 L 198.4 24.0 L 213.6 34.9 L 220.9 45.8 L 231.5 51.8 L 245.0 76.0 L 262.0 78.8 L 274.6 72.7 L 282.8 76.7 L 296.5 74.7 L 314.0 85.6 L 299.3 109.0 L 306.1 109.6 L 317.6 121.8 L 297.0 120.8 L 293.9 124.2 L 275.2 128.7 L 249.0 144.4 L 247.4 155.1 L 241.6 163.2 L 243.8 175.6 L 230.0 182.3 L 230.0 192.0 L 224.0 196.3 L 233.5 217.0 L 246.2 231.1 L 241.4 241.0 L 256.6 242.3 L 265.2 254.6 L 285.4 255.2 L 304.1 241.6 L 302.6 276.7 L 313.0 279.3 L 325.9 275.4 L 345.6 312.5 L 340.7 320.3 L 339.6 336.5 L 339.1 356.2 L 330.2 367.7 L 334.3 376.2 L 329.1 384.0 L 338.9 403.4 L 324.5 428.3 Z"
        fill="url(#peruGradient)"
        stroke="#00ffc2"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="peruGradient" x1="0" y1="0" x2={VIEW_W} y2={VIEW_H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000073" />
          <stop offset="100%" stopColor="#00004c" />
        </linearGradient>
      </defs>
      {PINS.map((pin) => (
        <g key={pin.id}>
          <circle cx={pin.x} cy={pin.y} r="10" fill="#00b7c2" opacity="0.35">
            <animate attributeName="r" values="8;14;8" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.45;0.05;0.45" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx={pin.x} cy={pin.y} r="5" fill="#00ffc2" stroke="#00004c" strokeWidth="1.5" />
          {showLabels && (
            <text
              x={pin.labelSide === 'left' ? pin.x - 10 : pin.x + 10}
              y={pin.y + 4}
              textAnchor={pin.labelSide === 'left' ? 'end' : 'start'}
              fontSize="14"
              fill="#ffffff"
              style={{ fontFamily: 'Gotham-Medium, sans-serif' }}
            >
              {pin.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
