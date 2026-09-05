const express = require('express');
const { query } = require('../db');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();
router.use(requireRole('admin'));

// Historial de correcciones/eliminaciones hechas por un admin sobre marcas de asistencia
// (ver PATCH /attendance/:id/admin, que es el único lugar que inserta en correcciones_auditoria).
router.get('/', async (req, res) => {
  const { empleadoId, desde, hasta } = req.query;
  const params = [];
  const conditions = [];

  if (empleadoId) { params.push(empleadoId); conditions.push(`a.empleado_id = $${params.length}`); }
  if (desde) { params.push(desde); conditions.push(`ca.creado_en >= $${params.length}`); }
  if (hasta) { params.push(hasta); conditions.push(`ca.creado_en <= $${params.length}::date + interval '1 day'`); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ca.*, a.empleado_id, a.fecha AS asistencia_fecha, a.tipo_marca AS asistencia_tipo_marca,
            u.nombre AS empleado_nombre, u.dni AS empleado_dni, admin.nombre AS admin_nombre
     FROM correcciones_auditoria ca
     LEFT JOIN asistencias a ON a.id = ca.asistencia_id
     LEFT JOIN usuarios u ON u.id = a.empleado_id
     LEFT JOIN usuarios admin ON admin.id = ca.admin_id
     ${whereClause}
     ORDER BY ca.creado_en DESC
     LIMIT 500`,
    params
  );
  res.json(rows);
});

module.exports = router;
