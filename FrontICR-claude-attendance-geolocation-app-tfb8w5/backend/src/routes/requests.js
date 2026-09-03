const express = require('express');
const { query } = require('../db');
const { requireRole } = require('../middleware/requireRole');
const { isWithinSite } = require('../utils/geo');
const { notifyAdminNewRequest, notifyEmployeeRequestResolved } = require('../services/notifications');

const router = express.Router();

router.post('/', async (req, res) => {
  const { tipoMarca, fecha, horaSolicitada, mensaje } = req.body;
  if (!tipoMarca || !fecha || !mensaje) {
    return res.status(400).json({ error: 'tipoMarca, fecha y mensaje son requeridos.' });
  }

  const { rows } = await query(
    `INSERT INTO solicitudes_correccion (empleado_id, fecha, tipo_marca, hora_solicitada, mensaje_empleado)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.user.id, fecha, tipoMarca, horaSolicitada || null, mensaje]
  );
  const solicitud = rows[0];

  await notifyAdminNewRequest(solicitud);
  res.status(201).json(solicitud);
});

router.get('/mine', async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM solicitudes_correccion WHERE empleado_id = $1 ORDER BY creado_en DESC',
    [req.user.id]
  );
  res.json(rows);
});

router.get('/pending', requireRole('admin'), async (req, res) => {
  const { rows } = await query(
    `SELECT s.*, u.nombre AS empleado_nombre, u.dni AS empleado_dni
     FROM solicitudes_correccion s JOIN usuarios u ON u.id = s.empleado_id
     WHERE s.estado = 'pendiente' ORDER BY s.creado_en`
  );
  res.json(rows);
});

router.patch('/:id/approve', requireRole('admin'), async (req, res) => {
  const { lat, lng, horaMarcada } = req.body;
  if (lat === undefined || lng === undefined || !horaMarcada) {
    return res.status(400).json({ error: 'lat, lng y horaMarcada son requeridos para aprobar y generar la marca.' });
  }

  const { rows } = await query('SELECT * FROM solicitudes_correccion WHERE id = $1', [req.params.id]);
  const solicitud = rows[0];
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada.' });
  if (solicitud.estado !== 'pendiente') return res.status(409).json({ error: 'La solicitud ya fue resuelta.' });

  const { rows: sedeRows } = await query(
    `SELECT s.* FROM empresas_sedes s JOIN usuarios u ON u.sede_id = s.id WHERE u.id = $1`,
    [solicitud.empleado_id]
  );
  const site = sedeRows[0];
  if (!site) return res.status(400).json({ error: 'El empleado no tiene una sede asignada.' });
  const { distanceMeters, withinArea } = isWithinSite(lat, lng, site);

  const { rows: marcaRows } = await query(
    `INSERT INTO asistencias
      (empleado_id, fecha, tipo_marca, hora_marcada, latitud, longitud, distancia_metros, dentro_area, origen)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'solicitud_aprobada') RETURNING *`,
    [solicitud.empleado_id, solicitud.fecha, solicitud.tipo_marca, horaMarcada, lat, lng, distanceMeters, withinArea]
  );
  const marca = marcaRows[0];

  const { rows: updatedRows } = await query(
    `UPDATE solicitudes_correccion
     SET estado = 'aprobada', admin_id = $1, asistencia_generada_id = $2, resuelto_en = now()
     WHERE id = $3 RETURNING *`,
    [req.user.id, marca.id, solicitud.id]
  );
  const resuelta = updatedRows[0];

  await notifyEmployeeRequestResolved(resuelta);
  res.json(resuelta);
});

router.patch('/:id/reject', requireRole('admin'), async (req, res) => {
  const { motivo } = req.body;
  if (!motivo) return res.status(400).json({ error: 'motivo es requerido para rechazar una solicitud.' });

  const { rows } = await query('SELECT * FROM solicitudes_correccion WHERE id = $1', [req.params.id]);
  const solicitud = rows[0];
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada.' });
  if (solicitud.estado !== 'pendiente') return res.status(409).json({ error: 'La solicitud ya fue resuelta.' });

  const { rows: updatedRows } = await query(
    `UPDATE solicitudes_correccion
     SET estado = 'rechazada', admin_id = $1, respuesta_admin = $2, resuelto_en = now()
     WHERE id = $3 RETURNING *`,
    [req.user.id, motivo, solicitud.id]
  );
  const resuelta = updatedRows[0];

  await notifyEmployeeRequestResolved(resuelta);
  res.json(resuelta);
});

module.exports = router;
