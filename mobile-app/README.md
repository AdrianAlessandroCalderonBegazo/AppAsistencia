# Asistencia — App móvil de empleados

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

Requiere el SDK de Flutter instalado.

```bash
cd mobile-app
flutter pub get
flutter run --dart-define=API_BASE_URL=https://tu-backend.example.com/api
```

Si no se pasa `API_BASE_URL`, se usa `http://localhost:3000/api` (útil para
correr contra el backend local en desarrollo, ver `../backend/.env.example`).

## Compilar el APK (Android)

No hace falta tener Flutter ni el Android SDK instalados localmente: el
workflow `.github/workflows/build-apk.yml` (en la raíz del repo) compila el
APK en GitHub Actions.

1. En GitHub, ve a **Settings → Secrets and variables → Actions → Variables**
   del repo y crea `API_BASE_URL` con la URL del backend ya desplegado
   (ej. `https://asistencia-backend.onrender.com/api`).
2. Ve a la pestaña **Actions → build android apk → Run workflow** (o simplemente
   haz push a `main` tocando algo en `mobile-app/`).
3. Cuando termine, descarga el artifact `asistencia-empleado-apk` — ahí está
   el `app-release.apk` listo para instalar en cualquier Android (activa
   "orígenes desconocidos" en el celular para instalarlo fuera de Play Store).

Si prefieres compilarlo vos mismo con el SDK instalado:
```bash
flutter build apk --release --dart-define=API_BASE_URL=https://tu-backend.example.com/api
```
El archivo queda en `build/app/outputs/flutter-apk/app-release.apk`.

## Publicar la versión web (iOS — "agregar a inicio")

Sin cuenta de Apple Developer ni Mac con Xcode, la forma más simple de que
un iPhone tenga esta app como ícono en la pantalla de inicio es compilar la
misma app Flutter para web y que el usuario la agregue desde Safari
("compartir" → "agregar a inicio"); queda instalada en modo standalone, sin
la barra de Safari, gracias al `manifest.json`/meta tags ya configurados en
`web/`.

Desplegar en Vercel:
1. Importa este repo en Vercel, con **Root Directory** = `mobile-app`.
2. En **Settings → Environment Variables** agrega `API_BASE_URL` con la URL
   del backend en Render.
3. Vercel usa `vercel.json`/`vercel-build.sh` de esta carpeta, que descargan
   Flutter y corren `flutter build web` automáticamente — no requiere
   configuración de build adicional.
4. Comparte la URL resultante a los empleados con iPhone; en Safari:
   compartir → "agregar a pantalla de inicio".

Este mismo build sirve también para Android (una PWA es una alternativa al
APK si alguien prefiere no instalar un archivo .apk).

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

## Endpoints usados

Los servicios en `lib/services/*_service.dart` llaman directamente a las
rutas reales del backend (ver el detalle completo en `../backend/README.md`):
`POST /auth/login`, `POST /auth/change-password`, `PUT /employees/me/fcm-token`,
`POST /attendance`, `POST /attendance/sync`, `GET /attendance/history`,
`DELETE /attendance/:id`, `GET /schedules/me`, `GET /requests/mine` y
`POST /requests`. Si cambia algún contrato del backend, solo hay que
ajustar el service correspondiente — el resto de la app no conoce detalles
de transporte.

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
