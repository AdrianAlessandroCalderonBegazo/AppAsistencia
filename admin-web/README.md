# panel admin — control de asistencia

panel web de administración para el sistema de control de asistencia y
geolocalización de empleados. proyecto independiente (react + vite +
tailwind), separado de la app móvil de empleados.

## requisitos

- node.js 18+
- el backend corriendo (ver carpeta `../backend`)

## configuración

1. instala dependencias:

   ```bash
   npm install
   ```

2. copia el archivo de variables de entorno y ajusta la url del backend:

   ```bash
   cp .env.example .env
   ```

   variable disponible:

   | variable       | descripción                                   | ejemplo                     |
   | -------------- | ---------------------------------------------- | ---------------------------- |
   | `VITE_API_URL` | url base de la api rest (sin `/` al final)     | `http://localhost:3000/api` |

3. modo desarrollo:

   ```bash
   npm run dev
   ```

4. build de producción:

   ```bash
   npm run build
   npm run preview   # para previsualizar el build localmente
   ```

## qué incluye

- login con dni + contraseña, con flujo obligatorio de cambio de
  contraseña cuando el backend indica `debe_cambiar_password`.
- dashboard con el estado de asistencia de hoy por empleado (presente,
  tarde, ausente, con anomalías).
- alta y baja de empleados.
- editor de horarios por empleado (días, entrada/salida, almuerzo,
  tolerancia).
- tabla de asistencias filtrable por empleado y rango de fechas, con
  corrección manual (siempre exige un motivo, nunca sobrescribe en
  silencio) y badges para anomalías, sincronización tardía y marcas
  creadas por una solicitud aprobada.
- bandeja de solicitudes de corrección (pendiente/aprobada/rechazada)
  con aprobación/rechazo y mensaje de respuesta.
- reportes: exportación de asistencias a csv por empleado y rango de
  fechas.
- configuración de sede: latitud, longitud y radio permitido (inputs
  numéricos simples, sin mapa embebido).
- modo oscuro con toggle persistente en `localStorage`.

## despliegue

### vercel

el archivo `vercel.json` ya incluye el rewrite necesario para que las
rutas de react-router funcionen en refresh directo. pasos:

1. importa el repositorio en vercel y selecciona esta carpeta
   (`admin-web`) como root directory del proyecto.
2. framework preset: `vite`.
3. agrega la variable de entorno `VITE_API_URL` en la configuración del
   proyecto en vercel.
4. deploy.

### netlify

también funciona sin cambios:

1. base directory: `admin-web`.
2. build command: `npm run build`.
3. publish directory: `admin-web/dist`.
4. agrega un archivo `_redirects` con `/* /index.html 200` si prefieres
   no usar `vercel.json`, o configura el mismo rewrite en netlify.toml.
5. define `VITE_API_URL` en las variables de entorno del sitio.
