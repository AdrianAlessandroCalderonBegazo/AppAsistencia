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

// Resumen por empleado: horas trabajadas (entrada→salida, descontando almuerzo si hay ambas
// marcas), tardanzas/salidas anticipadas según horario y marcas fuera del área asignada. Se
// calcula en JS a partir de las marcas crudas en vez de SQL — es más simple de leer/mantener
// y el volumen esperado (una empresa pequeña) no lo justifica.
router.get('/summary', async (req, res) => {
  const { empleadoId, desde, hasta } = req.query;
  const params = [];
  const conditions = ['a.anulada = false'];

  if (empleadoId) { params.push(empleadoId); conditions.push(`a.empleado_id = $${params.length}`); }
  if (desde) { params.push(desde); conditions.push(`a.fecha >= $${params.length}`); }
  if (hasta) { params.push(hasta); conditions.push(`a.fecha <= $${params.length}`); }

  const { rows } = await query(
    `SELECT a.*, u.nombre AS empleado_nombre, u.dni AS empleado_dni
     FROM asistencias a JOIN usuarios u ON u.id = a.empleado_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.empleado_id, a.fecha, a.hora_marcada`,
    params
  );

  const porEmpleado = new Map();
  for (const row of rows) {
    if (!porEmpleado.has(row.empleado_id)) {
      porEmpleado.set(row.empleado_id, {
        empleadoId: row.empleado_id,
        nombre: row.empleado_nombre,
        dni: row.empleado_dni,
        dias: new Map(), // fecha -> { [tipo_marca]: Date }
        tardanzas: 0,
        salidasAnticipadas: 0,
        marcasFueraDeArea: 0,
        anomalias: 0,
      });
    }
    const acc = porEmpleado.get(row.empleado_id);
    if (!row.dentro_area) acc.marcasFueraDeArea++;
    if (row.es_anomalia) acc.anomalias++;
    if (row.motivo_anomalia?.includes('llegada tardía')) acc.tardanzas++;
    if (row.motivo_anomalia?.includes('se retiró antes')) acc.salidasAnticipadas++;

    if (!acc.dias.has(row.fecha)) acc.dias.set(row.fecha, {});
    acc.dias.get(row.fecha)[row.tipo_marca] = new Date(row.hora_marcada);
  }

  const resultado = [...porEmpleado.values()].map((acc) => {
    let minutosTrabajados = 0;
    for (const marcasDia of acc.dias.values()) {
      const { entrada, salida, salida_almuerzo: salidaAlmuerzo, regreso_almuerzo: regresoAlmuerzo } = marcasDia;
      if (!entrada || !salida || salida <= entrada) continue;
      let minutos = (salida - entrada) / 60000;
      if (salidaAlmuerzo && regresoAlmuerzo && regresoAlmuerzo > salidaAlmuerzo) {
        minutos -= (regresoAlmuerzo - salidaAlmuerzo) / 60000;
      }
      minutosTrabajados += Math.max(minutos, 0);
    }
    return {
      empleadoId: acc.empleadoId,
      nombre: acc.nombre,
      dni: acc.dni,
      diasConMarca: acc.dias.size,
      horasTrabajadas: Math.round((minutosTrabajados / 60) * 100) / 100,
      tardanzas: acc.tardanzas,
      salidasAnticipadas: acc.salidasAnticipadas,
      marcasFueraDeArea: acc.marcasFueraDeArea,
      anomalias: acc.anomalias,
    };
  });
  resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
  res.json(resultado);
});

module.exports = router;
