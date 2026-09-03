const express = require('express');
const { query } = require('../db');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();
router.use(requireRole('admin'));

const CSV_HEADERS = [
  'empleado_dni', 'empleado_nombre', 'fecha', 'tipo_marca', 'hora_marcada',
  'dentro_area', 'distancia_metros', 'origen', 'es_anomalia', 'motivo_anomalia',
  'sincronizacion_tardia', 'anulada',
];

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows) {
  const lines = [CSV_HEADERS.join(',')];
  for (const row of rows) {
    lines.push(CSV_HEADERS.map((h) => escapeCsvField(row[h])).join(','));
  }
  return lines.join('\n');
}

router.get('/attendance.csv', async (req, res) => {
  const { empleadoId, desde, hasta } = req.query;
  const params = [];
  const conditions = [];

  if (empleadoId) { params.push(empleadoId); conditions.push(`a.empleado_id = $${params.length}`); }
  if (desde) { params.push(desde); conditions.push(`a.fecha >= $${params.length}`); }
  if (hasta) { params.push(hasta); conditions.push(`a.fecha <= $${params.length}`); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT u.dni AS empleado_dni, u.nombre AS empleado_nombre, a.*
     FROM asistencias a JOIN usuarios u ON u.id = a.empleado_id
     ${whereClause} ORDER BY a.fecha, a.hora_marcada`,
    params
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="asistencias.csv"');
  res.send(toCsv(rows));
});

module.exports = router;
