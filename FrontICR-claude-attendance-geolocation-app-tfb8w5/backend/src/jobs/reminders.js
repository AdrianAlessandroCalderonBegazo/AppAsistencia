const cron = require('node-cron');
const { query } = require('../db');
const { notifyUpcomingShift } = require('../services/notifications');

const REMINDER_WINDOW_MINUTES = 10;

// Dedupe en memoria: suficiente para un piloto de ~30 usuarios en un solo proceso.
// Se limpia por sí solo porque la clave incluye la fecha del día.
const alreadyNotified = new Set();

function minutesUntil(nowDate, timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const target = new Date(nowDate);
  target.setHours(hours, minutes, 0, 0);
  return (target.getTime() - nowDate.getTime()) / 60000;
}

async function checkAndNotify() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dayOfWeek = now.getDay(); // 0=domingo .. 6=sábado, igual que dias_semana en horarios

  const { rows: horarios } = await query(
    `SELECT h.*, u.id AS empleado_id FROM horarios h
     JOIN usuarios u ON u.id = h.empleado_id
     WHERE h.activo = true AND u.estado = 'activo' AND $1 = ANY(h.dias_semana)`,
    [dayOfWeek]
  );

  for (const horario of horarios) {
    for (const [tipo, horaField] of [['entrada', 'hora_entrada'], ['salida', 'hora_salida']]) {
      const minutosFaltantes = minutesUntil(now, horario[horaField]);
      if (minutosFaltantes < 0 || minutosFaltantes > REMINDER_WINDOW_MINUTES) continue;

      const dedupeKey = `${horario.empleado_id}:${today}:${tipo}`;
      if (alreadyNotified.has(dedupeKey)) continue;

      alreadyNotified.add(dedupeKey);
      await notifyUpcomingShift(horario.empleado_id, tipo, Math.round(minutosFaltantes));
    }
  }
}

function startReminderJob() {
  if (process.env.DISABLE_REMINDERS_CRON === 'true') {
    console.log('[reminders] Cron deshabilitado por DISABLE_REMINDERS_CRON=true.');
    return null;
  }
  return cron.schedule('* * * * *', () => {
    checkAndNotify().catch((err) => console.error('[reminders] Error en el job:', err.message));
  });
}

module.exports = { startReminderJob };
