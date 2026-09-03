#!/usr/bin/env bash
# Build de producción para desplegar la app del empleado como sitio web (Vercel/Netlify).
# El contenedor de build de Vercel no trae Flutter preinstalado, así que lo descargamos acá.
# API_BASE_URL debe estar configurada como variable de entorno del proyecto en Vercel
# (Settings -> Environment Variables), apuntando al backend ya desplegado en Render.
set -euo pipefail

if [ -z "${API_BASE_URL:-}" ]; then
  echo "ERROR: falta la variable de entorno API_BASE_URL en la configuración del proyecto en Vercel." >&2
  exit 1
fi

git clone --depth 1 --branch stable https://github.com/flutter/flutter.git /tmp/flutter
export PATH="$PATH:/tmp/flutter/bin"

flutter config --no-analytics
flutter pub get
flutter build web --release --dart-define=API_BASE_URL="$API_BASE_URL"
