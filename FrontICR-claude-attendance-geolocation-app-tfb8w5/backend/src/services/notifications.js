const { query } = require('../db');

// firebase-admin solo se inicializa si las tres credenciales están presentes, así el API
// arranca en desarrollo sin Firebase configurado (las funciones de abajo simplemente loguean).
let messaging = null;
const hasFirebaseConfig =
  process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

if (hasFirebaseConfig) {
  const admin = require('firebase-admin');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  messaging = admin.messaging();
} else {
  console.warn('[notifications] Firebase no configurado: las notificaciones push serán solo logs.');
}

async function sendToToken(fcmToken, notification, data = {}) {
  if (!fcmToken) return;
  if (!messaging) {
    console.log('[notifications:noop]', notification, data);
    return;
  }
  try {
    await messaging.send({
      token: fcmToken,
      notification,
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    });
  } catch (err) {
    console.error('[notifications] Error enviando push:', err.message);
  }
}

async function sendToUserId(userId, notification, data = {}) {
  const { rows } = await query('SELECT fcm_token FROM usuarios WHERE id = $1', [userId]);
  if (rows[0]) await sendToToken(rows[0].fcm_token, notification, data);
}

async function sendToAdmins(notification, data = {}) {
  const { rows } = await query(
    "SELECT fcm_token FROM usuarios WHERE rol = 'admin' AND estado = 'activo' AND fcm_token IS NOT NULL"
  );
  await Promise.all(rows.map((r) => sendToToken(r.fcm_token, notification, data)));
}

async function notifyAdminNewRequest(solicitud) {
  await sendToAdmins(
    { title: 'Nueva solicitud de corrección', body: `Solicitud pendiente (${solicitud.tipo_marca}, ${solicitud.fecha})` },
    { tipo: 'solicitud_nueva', solicitudId: solicitud.id }
  );
}

async function notifyEmployeeRequestResolved(solicitud) {
  const aprobada = solicitud.estado === 'aprobada';
  await sendToUserId(
    solicitud.empleado_id,
    {
      title: aprobada ? 'Solicitud aprobada' : 'Solicitud rechazada',
      body: aprobada ? 'Tu solicitud de corrección fue aprobada.' : `Tu solicitud fue rechazada: ${solicitud.respuesta_admin || ''}`,
    },
    { tipo: 'solicitud_resuelta', solicitudId: solicitud.id }
  );
}

async function notifyEmployeeMarkEdited(asistencia, motivo) {
  await sendToUserId(
    asistencia.empleado_id,
    { title: 'Tu registro de asistencia fue corregido', body: `Motivo: ${motivo}` },
    { tipo: 'marca_corregida', asistenciaId: asistencia.id }
  );
}

async function notifyUpcomingShift(empleadoId, tipo, minutos) {
  await sendToUserId(
    empleadoId,
    { title: 'Recordatorio de horario', body: `Faltan ${minutos} minutos para tu ${tipo === 'entrada' ? 'entrada' : 'salida'}.` },
    { tipo: 'recordatorio_horario' }
  );
}

module.exports = {
  notifyAdminNewRequest,
  notifyEmployeeRequestResolved,
  notifyEmployeeMarkEdited,
  notifyUpcomingShift,
};
