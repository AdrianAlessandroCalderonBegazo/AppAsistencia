-- Esquema PostgreSQL para el sistema de control de asistencia con geolocalización.
-- Compatible con planes gratuitos de Supabase / Neon. No requiere PostGIS:
-- la validación de distancia se hace con la fórmula de Haversine (ver backend/src/utils/geo.js),
-- pero se deja comentada la alternativa con PostGIS por si el proveedor la soporta.

-- CREATE EXTENSION IF NOT EXISTS postgis; -- opcional, no usado en la implementación por defecto

CREATE TABLE IF NOT EXISTS empresas_sedes (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL,
  latitud       DOUBLE PRECISION NOT NULL,
  longitud      DOUBLE PRECISION NOT NULL,
  radio_metros  INTEGER NOT NULL DEFAULT 100,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id                   SERIAL PRIMARY KEY,
  dni                  VARCHAR(20) UNIQUE NOT NULL,
  nombre               VARCHAR(160) NOT NULL,
  password_hash        VARCHAR(255) NOT NULL,
  rol                  VARCHAR(20) NOT NULL CHECK (rol IN ('empleado', 'admin')),
  estado               VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  debe_cambiar_password BOOLEAN NOT NULL DEFAULT true,
  sede_id              INTEGER REFERENCES empresas_sedes(id),
  fcm_token            VARCHAR(255),
  creado_en            TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS horarios (
  id                  SERIAL PRIMARY KEY,
  empleado_id         INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  dias_semana         SMALLINT[] NOT NULL, -- 0=domingo .. 6=sábado
  hora_entrada        TIME NOT NULL,
  hora_salida         TIME NOT NULL,
  hora_inicio_almuerzo TIME,
  hora_fin_almuerzo   TIME,
  tolerancia_minutos  INTEGER NOT NULL DEFAULT 10,
  activo              BOOLEAN NOT NULL DEFAULT true,
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asistencias (
  id                SERIAL PRIMARY KEY,
  empleado_id       INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha             DATE NOT NULL,
  tipo_marca        VARCHAR(20) NOT NULL CHECK (tipo_marca IN ('entrada', 'salida_almuerzo', 'regreso_almuerzo', 'salida')),
  hora_marcada      TIMESTAMPTZ NOT NULL,       -- hora del dispositivo (offline-first)
  hora_recibida_servidor TIMESTAMPTZ NOT NULL DEFAULT now(),
  latitud           DOUBLE PRECISION NOT NULL,
  longitud          DOUBLE PRECISION NOT NULL,
  distancia_metros  DOUBLE PRECISION,
  dentro_area       BOOLEAN NOT NULL,
  origen            VARCHAR(30) NOT NULL DEFAULT 'normal' CHECK (origen IN ('normal', 'offline_sync', 'solicitud_aprobada', 'correccion_admin')),
  es_anomalia       BOOLEAN NOT NULL DEFAULT false,
  motivo_anomalia   VARCHAR(255),
  sincronizacion_tardia BOOLEAN NOT NULL DEFAULT false,
  editable_hasta    TIMESTAMPTZ,  -- ventana de autocorrección (marcada + 10 min)
  anulada           BOOLEAN NOT NULL DEFAULT false, -- true si el propio empleado la deshizo dentro de la ventana
  creado_en         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asistencias_empleado_fecha ON asistencias(empleado_id, fecha);

CREATE TABLE IF NOT EXISTS correcciones_auditoria (
  id              SERIAL PRIMARY KEY,
  asistencia_id   INTEGER NOT NULL REFERENCES asistencias(id) ON DELETE CASCADE,
  admin_id        INTEGER NOT NULL REFERENCES usuarios(id),
  valor_anterior  JSONB NOT NULL,
  valor_nuevo     JSONB NOT NULL,
  motivo          TEXT NOT NULL,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solicitudes_correccion (
  id                SERIAL PRIMARY KEY,
  empleado_id       INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha             DATE NOT NULL,
  tipo_marca        VARCHAR(20) NOT NULL CHECK (tipo_marca IN ('entrada', 'salida_almuerzo', 'regreso_almuerzo', 'salida')),
  hora_solicitada   TIME,
  mensaje_empleado  TEXT NOT NULL,
  estado            VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  respuesta_admin   TEXT,
  admin_id          INTEGER REFERENCES usuarios(id),
  asistencia_generada_id INTEGER REFERENCES asistencias(id),
  creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
  resuelto_en       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_correccion(estado);
