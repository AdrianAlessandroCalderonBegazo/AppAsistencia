# Inversiones ICR — Sitio corporativo

Frontend del sitio corporativo de Inversiones ICR: React + Vite + Tailwind CSS + React Router.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción (carpeta dist/)
npm run preview  # previsualizar el build
```

## Estructura

- `src/pages/` — una página por ruta (`Home`, `Nosotros`, `Sectores`, `Soluciones`, `Experiencia`, `ProyectoDetalle`, `Contacto`).
- `src/components/` — Navbar, Footer, Layout, Carousel, FAQAccordion, ProjectCard, ProjectImage, HeroBackground, VideoWithFallback, PeruMap, WhatsAppButton, iconos de sector e ilustraciones de respaldo.
- `src/data/content.js` — todo el contenido textual del sitio (propósito, misión/visión, valores, proyectos, FAQ, datos de contacto). Editar aquí primero ante cualquier cambio de copy.
- `public/fonts/` — tipografías Gotham (Black, Bold, Medium) declaradas vía `@font-face` en `src/index.css`.
