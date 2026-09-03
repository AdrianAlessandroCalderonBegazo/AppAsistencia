# FrontICR — app móvil de empleados

App Flutter (Android + iOS, un solo código) para el lado **empleado** del
sistema de control de asistencia con geolocalización. El panel de
administración es una aplicación web aparte (`../admin-web`) que habla con el
mismo backend (`../backend`); esta app no incluye ninguna función de admin.

## Qué hace

- Login con DNI + contraseña, con cambio de contraseña obligatorio en el
  primer ingreso (contraseña genérica).
- Cuatro marcas de asistencia (entrada, salida a almuerzo, regreso de
  almuerzo, salida final) con captura de GPS. El cliente nunca bloquea una
  marca por "orden incorrecto": eso lo decide el backend.
- Confirmación antes de volver a registrar un tipo de marca ya hecho hoy.
- Ventana de autocorrección de ~10 minutos para deshacer una marca propia
  desde la pantalla principal o el historial.
- Cola offline (sqflite): si no hay conexión, la marca se guarda localmente
  con "pendiente de sincronizar" y se reintenta enviar al recuperar
  conectividad o al volver la app a primer plano.
- Señal de mock-location (Android) incluida en cada marca para que el
  backend la use como capa adicional de defensa, sin bloquear al usuario.
- Pantallas de horario asignado, historial de marcas y solicitudes de
  corrección (crear y ver estado).
- Notificaciones push vía Firebase Cloud Messaging (recordatorios de
  horario, resolución de solicitudes, correcciones de un admin).

## Cómo correrlo

Requiere el SDK de Flutter instalado (no incluido en este entorno de
generación de código). Con el SDK disponible:

```bash
cd mobile-app
flutter pub get
flutter run --dart-define=API_BASE_URL=https://tu-backend.example.com/api
```

Si no se pasa `API_BASE_URL`, se usa `http://localhost:3000/api` (útil para
correr contra el backend local en desarrollo, ver `../backend/.env.example`).

Para builds de release, pasa la misma variable con `flutter build apk` /
`flutter build ios` (o configúrala por flavor si el pilotaje crece más allá
de los ~30 empleados iniciales).

## Configuración de Firebase (push)

La app inicializa Firebase de forma tolerante: si los archivos de
configuración nativos no están presentes, sigue funcionando sin push en vez
de fallar. Para habilitarlo:

- Android: coloca `google-services.json` en `android/app/` (no se commitea).
- iOS: coloca `GoogleService-Info.plist` en `ios/Runner/` (no se commitea).
- Ambos deben pertenecer al mismo proyecto Firebase configurado en el
  backend (`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`
  en `backend/.env`), ya que el server envía las notificaciones vía
  `firebase-admin` (ver `backend/src/services/notifications.js`).
- El token FCM del dispositivo se registra automáticamente contra el backend
  después del login (`AuthService.registerFcmToken`).

Este proyecto se generó a mano siguiendo la estructura estándar de
`flutter create` (no se ejecutó el comando porque el SDK de Flutter no está
disponible en este entorno). `android/` e `ios/` no se incluyeron: al correr
`flutter create --org com.icr .` sobre este directorio, Flutter genera esas
carpetas nativas sin tocar nada de `lib/`.

## Contrato de API asumido

El backend (`../backend`) todavía no tiene rutas implementadas al momento de
escribir esta app, así que los endpoints usados aquí son el contrato
propuesto, consistente con `database/schema.sql`:

| Método | Endpoint | Uso |
| --- | --- | --- |
| POST | `/auth/login` | `{ dni, password }` → `{ token, usuario }` |
| POST | `/auth/cambiar-password` | `{ password_actual, password_nueva }` |
| POST | `/auth/fcm-token` | registra el token push del dispositivo |
| GET | `/asistencias?rango=hoy` | marcas del empleado autenticado hoy |
| GET | `/asistencias?desde=&hasta=` | historial por rango de fechas |
| POST | `/asistencias` | `{ tipo_marca, hora_marcada, latitud, longitud, mock_location }` |
| DELETE | `/asistencias/:id` | deshacer una marca dentro de `editable_hasta` |
| POST | `/asistencias/sync` | reenvío de una marca capturada offline |
| GET | `/horarios/mio` | horario asignado del empleado |
| GET | `/solicitudes` | solicitudes de corrección propias |
| POST | `/solicitudes` | `{ tipo_marca, fecha, hora_solicitada?, mensaje_empleado }` |

Los nombres de campo (snake_case, en español) siguen exactamente las
columnas de `asistencias`, `solicitudes_correccion` y `horarios` en
`database/schema.sql`, para minimizar el mapeo cuando el backend implemente
estas rutas. Si el backend termina usando otros nombres de endpoint, solo
hay que ajustar `lib/services/*_service.dart` — el resto de la app no
conoce detalles de transporte.

## Estructura

```
lib/
  main.dart                     arranque, tema, gate de sesión
  theme/app_theme.dart          Material 3 claro/oscuro + colores semánticos
  models/                       User, AttendanceMark, Schedule, CorrectionRequest
  services/
    api_client.dart             Dio + manejo de JWT
    auth_service.dart           login, cambio de contraseña, token FCM
    attendance_service.dart     marcar, historial, deshacer, sync offline
    offline_queue_service.dart  cola local (sqflite) de marcas sin enviar
    location_service.dart       captura de GPS + señal de mock-location
    notification_service.dart   registro de push (Firebase Messaging)
    schedule_service.dart       horario asignado
    request_service.dart        solicitudes de corrección
  screens/                      login, cambiar contraseña, home, horario,
                                 historial, nueva solicitud, lista de solicitudes
  widgets/                      status_pill (chips de estado), mark_button
```

## Diseño

Mismo sistema visual que el panel admin (`../admin-web`): Material 3 plano,
sin gradientes ni sombras marcadas, radios de 12–16px, bordes delgados en
vez de elevación, y una paleta semántica idéntica en hex a
`admin-web/tailwind.config.js` (verde=éxito, ámbar=advertencia/no
bloqueante, rojo=alerta, azul=acción primaria, gris=secundario). Los chips
de estado usan fondo suave + texto más oscuro del mismo matiz, nunca texto
negro sobre color. Modo oscuro definido desde el inicio en
`AppTheme.light()` / `AppTheme.dark()`, seguido por `ThemeMode.system`.
