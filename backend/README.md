# FrontICR Backend

API REST en Node.js + Express para el sistema de control de asistencia con geolocalización
(piloto de ~30 usuarios). Usa `pg` directo (sin ORM) contra el esquema en `database/schema.sql`.

## Ejecutar localmente

1. Levantar Postgres (local, Supabase o Neon) y aplicar el esquema:
   ```bash
   psql "$DATABASE_URL" -f ../database/schema.sql
   ```
2. Copiar variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Completar al menos `DATABASE_URL`, `JWT_SECRET` y `JWT_REFRESH_SECRET`.
3. Instalar dependencias y arrancar:
   ```bash
   npm install
   npm run dev   # con nodemon
   # o
   npm start
   ```

Crear el primer admin manualmente (no hay endpoint de auto-registro, es a propósito):
```sql
INSERT INTO usuarios (dni, nombre, password_hash, rol, debe_cambiar_password)
VALUES ('00000000', 'Admin', '<hash bcrypt>', 'admin', false);
```
El hash se genera con `node -e "console.log(require('bcrypt').hashSync('tu-clave', 10))"`.

## Regla de contraseña genérica

Al crear un empleado o resetear su contraseña, se asigna: **primeros 4 dígitos del DNI + "Icr"**
(ej. DNI `12345678` → `1234Icr`). Ver `src/utils/genericPassword.js`. El login con esa contraseña
funciona, pero `debe_cambiar_password` queda en `true` y el middleware `requirePasswordChanged`
bloquea todas las rutas (salvo `/auth/*`) hasta que el usuario cambie su clave.

## Autenticación

- `POST /auth/login` → `{ dni, password }` → `{ accessToken, refreshToken, debeCambiarPassword, usuario }`.
- `POST /auth/refresh` → `{ refreshToken }` → nuevo `accessToken`/`refreshToken`.
- `POST /auth/change-password` → `{ currentPassword, newPassword }` (requiere access token; es la
  única ruta protegida accesible mientras `debe_cambiar_password` sea `true`).

El access token dura poco (`JWT_ACCESS_EXPIRES_IN`, default 2h); el refresh token dura semanas
(`JWT_REFRESH_EXPIRES_IN`, default 30d) y solo sirve para pedir un access token nuevo.

## Endpoints principales

Todas las rutas debajo de esta lista requieren `Authorization: Bearer <accessToken>`.

### Empleados (`/employees`, admin salvo donde se indique)
- `GET /employees` — lista empleados.
- `POST /employees` — crea `{ dni, nombre, sedeId, horarioInicial? }`, asigna contraseña genérica.
- `PATCH /employees/:id/reset-password` — vuelve a la contraseña genérica y fuerza cambio.
- `PATCH /employees/:id/deactivate` / `/reactivate` — baja/alta lógica (conserva historial).
- `PATCH /employees/:id/sede` — reasigna sede.
- `PUT /employees/me/fcm-token` — cualquier usuario autenticado registra su token push.

### Asistencia (`/attendance`)
- `POST /attendance` — marca `{ tipoMarca, horaMarcada, lat, lng }`. El servidor calcula
  `dentro_area`/`distancia_metros` con Haversine (nunca confía en un "isValid" del cliente) y
  marca `es_anomalia` si es duplicada o fuera de secuencia — nunca la rechaza.
- `POST /attendance/sync` — sincronización offline: `{ marcas: [...] }`, origen `offline_sync`,
  valida geolocalización al momento de sincronizar y marca `sincronizacion_tardia` si pasó más de
  1 hora entre `horaMarcada` y ahora.
- `GET /attendance/history?desde&hasta` — historial propio.
- `DELETE /attendance/:id` / `PATCH /attendance/:id` — autocorrección del empleado dentro de los
  10 minutos posteriores a la marca (`editable_hasta`); pasada la ventana responde 403 y el
  empleado debe usar `/requests`.
- `PATCH /attendance/:id/admin` (admin) — corrección manual; requiere `motivo` en el body y deja
  auditoría en `correcciones_auditoria` (valor anterior/nuevo) antes de aplicar el cambio.
- `GET /attendance/employee/:empleadoId` (admin) — historial de un empleado.

### Solicitudes de corrección (`/requests`)
- `POST /requests` — empleado crea `{ tipoMarca, fecha, horaSolicitada?, mensaje }`; notifica admins.
- `GET /requests/mine` — solicitudes propias.
- `GET /requests/pending` (admin) — solicitudes pendientes.
- `PATCH /requests/:id/approve` (admin) — `{ lat, lng, horaMarcada }`; genera la marca
  (`origen='solicitud_aprobada'`), la enlaza en `asistencia_generada_id` y notifica al empleado.
- `PATCH /requests/:id/reject` (admin) — `{ motivo }`; notifica al empleado.

### Horarios (`/schedules`, admin)
CRUD sobre `horarios`: `GET /schedules/employee/:empleadoId`, `POST /schedules`,
`PATCH /schedules/:id`, `DELETE /schedules/:id` (desactiva en vez de borrar).

### Sedes (`/sites`)
`GET /sites` (cualquier usuario autenticado), `POST/PATCH/DELETE /sites` (admin) sobre
`empresas_sedes` (lat/lng/radio).

### Reportes (`/reports`, admin)
`GET /reports/attendance.csv?empleadoId&desde&hasta` — CSV de asistencias.

## Notificaciones push

`src/services/notifications.js` usa Firebase Admin (FCM). Si `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY` no están configuradas, las funciones no fallan:
solo registran el intento en consola. Esto permite correr y probar el API en desarrollo sin
Firebase. El job `src/jobs/reminders.js` (node-cron, cada minuto) recuerda entradas/salidas
próximas (~10 min antes) usando un `Set` en memoria para no duplicar avisos el mismo día
(suficiente para un piloto de un solo proceso). Se desactiva con `DISABLE_REMINDERS_CRON=true`.

## Despliegue

- **Base de datos**: Supabase o Neon (plan gratis) — aplicar `database/schema.sql` y copiar la
  cadena de conexión a `DATABASE_URL`. Migrar de plan gratis a pago, o de un proveedor a otro, es
  solo cambiar esa variable de entorno.
- **API**: Render (plan free) usando `render.yaml` en este directorio — `render blueprint deploy`
  o conectar el repo y apuntar el blueprint a `backend/`. Completar en el dashboard las variables
  marcadas `sync: false` (`DATABASE_URL`, `CORS_ORIGIN`, `JWT_SECRET`, `JWT_REFRESH_SECRET` y,
  opcionalmente, las `FIREBASE_*`).
