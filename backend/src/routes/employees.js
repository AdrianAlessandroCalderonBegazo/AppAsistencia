const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../db');
const { requireRole } = require('../middleware/requireRole');
const { genericPasswordFor } = require('../utils/genericPassword');

const router = express.Router();
const SALT_ROUNDS = 10;

const PUBLIC_COLUMNS = 'id, dni, nombre, rol, estado, debe_cambiar_password, sede_id, creado_en, actualizado_en';

// Un empleado puede tener más de una sede asignada (ver empleado_sedes): rota entre locales,
// o empieza la jornada en una y la termina en otra. Se listan todas para el panel admin.
async function attachSedes(empleados) {
  if (empleados.length === 0) return empleados;
  const { rows } = await query(
    `SELECT es.empleado_id, s.id, s.nombre, s.latitud, s.longitud, s.radio_metros
     FROM empleado_sedes es JOIN empresas_sedes s ON s.id = es.sede_id
     WHERE es.empleado_id = ANY($1)
     ORDER BY s.nombre`,
    [empleados.map((e) => e.id)]
  );
  const sedesPorEmpleado = new Map();
  for (const row of rows) {
    const lista = sedesPorEmpleado.get(row.empleado_id) || [];
    lista.push({
      id: row.id, nombre: row.nombre, latitud: row.latitud, longitud: row.longitud, radio_metros: row.radio_metros,
    });
    sedesPorEmpleado.set(row.empleado_id, lista);
  }
  return empleados.map((e) => ({ ...e, sedes: sedesPorEmpleado.get(e.id) || [] }));
}

router.get('/', requireRole('admin'), async (req, res) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM usuarios WHERE rol = 'empleado' ORDER BY nombre`
  );
  res.json(await attachSedes(rows));
});

router.post('/', requireRole('admin'), async (req, res) => {
  const { dni, nombre, sedeIds, horarioInicial } = req.body;
  const idsSedes = Array.isArray(sedeIds) ? sedeIds.filter((id) => id != null) : [];
  if (!dni || !nombre || idsSedes.length === 0) {
    return res.status(400).json({ error: 'dni, nombre y al menos una sede (sedeIds) son requeridos.' });
  }

  const passwordHash = await bcrypt.hash(genericPasswordFor(dni), SALT_ROUNDS);

  try {
    // sede_id se mantiene solo por compatibilidad histórica (la primera sede asignada);
    // la fuente de verdad para "en qué sedes puede marcar" es siempre empleado_sedes.
    const { rows } = await query(
      `INSERT INTO usuarios (dni, nombre, password_hash, rol, sede_id, debe_cambiar_password)
       VALUES ($1, $2, $3, 'empleado', $4, true) RETURNING ${PUBLIC_COLUMNS}`,
      [dni, nombre, passwordHash, idsSedes[0]]
    );
    const empleado = rows[0];

    for (const sedeId of idsSedes) {
      await query('INSERT INTO empleado_sedes (empleado_id, sede_id) VALUES ($1, $2)', [empleado.id, sedeId]);
    }

    if (horarioInicial) {
      const h = horarioInicial;
      await query(
        `INSERT INTO horarios (empleado_id, dias_semana, hora_entrada, hora_salida, duracion_almuerzo_minutos, tolerancia_minutos)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          empleado.id,
          h.diasSemana,
          h.horaEntrada,
          h.horaSalida,
          h.duracionAlmuerzoMinutos || null,
          h.toleranciaMinutos ?? 10,
        ]
      );
    }

    const [conSedes] = await attachSedes([empleado]);
    res.status(201).json(conSedes);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe un usuario con ese DNI.' });
    throw err;
  }
});

router.patch('/:id/reset-password', requireRole('admin'), async (req, res) => {
  const { rows } = await query('SELECT dni FROM usuarios WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Empleado no encontrado.' });

  const passwordHash = await bcrypt.hash(genericPasswordFor(rows[0].dni), SALT_ROUNDS);
  await query(
    `UPDATE usuarios SET password_hash = $1, debe_cambiar_password = true, actualizado_en = now() WHERE id = $2`,
    [passwordHash, req.params.id]
  );
  res.json({ message: 'Contraseña restablecida a la genérica. El empleado deberá cambiarla al ingresar.' });
});

router.patch('/:id/deactivate', requireRole('admin'), async (req, res) => {
  const { rows } = await query(
    `UPDATE usuarios SET estado = 'inactivo', actualizado_en = now() WHERE id = $1 AND rol = 'empleado'
     RETURNING ${PUBLIC_COLUMNS}`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Empleado no encontrado.' });
  res.json(rows[0]);
});

router.patch('/:id/reactivate', requireRole('admin'), async (req, res) => {
  const { rows } = await query(
    `UPDATE usuarios SET estado = 'activo', actualizado_en = now() WHERE id = $1 AND rol = 'empleado'
     RETURNING ${PUBLIC_COLUMNS}`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Empleado no encontrado.' });
  res.json(rows[0]);
});

// Reemplaza el conjunto completo de sedes asignadas a un empleado (agregar/quitar sedes,
// ej. cuando lo cambian de local o empieza a rotar entre dos).
router.patch('/:id/sedes', requireRole('admin'), async (req, res) => {
  const { sedeIds } = req.body;
  const idsSedes = Array.isArray(sedeIds) ? sedeIds.filter((id) => id != null) : [];
  if (idsSedes.length === 0) return res.status(400).json({ error: 'sedeIds debe tener al menos una sede.' });

  const { rows } = await query(`SELECT id FROM usuarios WHERE id = $1 AND rol = 'empleado'`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Empleado no encontrado.' });

  await query('DELETE FROM empleado_sedes WHERE empleado_id = $1', [req.params.id]);
  for (const sedeId of idsSedes) {
    await query('INSERT INTO empleado_sedes (empleado_id, sede_id) VALUES ($1, $2)', [req.params.id, sedeId]);
  }
  // sede_id queda como referencia histórica a la primera sede del conjunto actual.
  await query('UPDATE usuarios SET sede_id = $1, actualizado_en = now() WHERE id = $2', [idsSedes[0], req.params.id]);

  const { rows: empleadoRows } = await query(`SELECT ${PUBLIC_COLUMNS} FROM usuarios WHERE id = $1`, [req.params.id]);
  const [conSedes] = await attachSedes(empleadoRows);
  res.json(conSedes);
});

// Registra/actualiza el token FCM del usuario autenticado (empleado o admin) para recibir push.
router.put('/me/fcm-token', async (req, res) => {
  const { fcmToken } = req.body;
  await query('UPDATE usuarios SET fcm_token = $1, actualizado_en = now() WHERE id = $2', [
    fcmToken || null,
    req.user.id,
  ]);
  res.json({ message: 'Token FCM actualizado.' });
});

module.exports = router;
