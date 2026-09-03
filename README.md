# App de control de asistencia con geolocalización

Sistema piloto de control de asistencia para una empresa de ~30 empleados. Marca de asistencia
solo dentro del área de trabajo (validado siempre en el servidor), panel de administrador
separado, y arquitectura pensada para correr en planes gratuitos y escalar a planes pagos
sin reescribir código, solo configuración.

## Componentes

| Carpeta | Qué es | Stack |
|---|---|---|
| `database/` | Esquema PostgreSQL (`schema.sql`) | PostgreSQL, Haversine (sin dependencia de PostGIS) |
| `backend/` | API REST — única fuente de verdad | Node.js + Express + `pg` |
| `admin-web/` | Panel de administrador | React + Vite + Tailwind |
| `mobile-app/` | App del empleado (Android/iOS) | Flutter |

Cada carpeta es un proyecto independiente con su propio `package.json`/`pubspec.yaml` y README
con instrucciones de instalación y despliegue.

## Roles

Dos roles completamente separados, sin cuentas híbridas: **empleado** (app móvil) y
**admin** (panel web). Login por DNI, sin correo electrónico.

## Flujo de despliegue gratuito → pago (sin cambios de código)

1. **Base de datos**: Supabase o Neon (free tier). Aplicar `database/schema.sql`. La única
   config es `DATABASE_URL` en `backend/.env`.
2. **Backend**: Render (free tier web service). Ver `backend/render.yaml` y `backend/.env.example`.
3. **Panel admin**: Vercel o Netlify (free tier, sitio estático). Ver `admin-web/vercel.json`
   y `admin-web/.env.example` (`VITE_API_URL` apunta al backend en Render).
4. **Notificaciones push**: Firebase Cloud Messaging (gratuito). Credenciales vía variables
   de entorno del backend (`FIREBASE_*`) y `google-services.json` / `GoogleService-Info.plist`
   en `mobile-app/` (no se commitean, ver `mobile-app/README.md`).

Migrar a un plan pago de cualquiera de estos proveedores es solo cambiar variables de entorno
(`DATABASE_URL`, URLs, credenciales) — ningún componente depende de una característica
exclusiva del tier gratuito.

## Seguridad

- La validación de "¿está dentro del área permitida?" ocurre siempre en `backend/`
  (`src/utils/geo.js`), nunca se confía en un flag enviado por el cliente.
- Contraseñas con bcrypt, nunca en texto plano.
- Todo cambio manual de un admin sobre una marca de asistencia queda en
  `correcciones_auditoria` (quién, cuándo, motivo, valor anterior/nuevo).
- Tokens JWT de corta duración con refresh token.

Ver el detalle funcional completo (marcado, modo offline, solicitudes de corrección,
horarios, notificaciones, diseño visual) en la especificación original del proyecto.
