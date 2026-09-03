const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../db');
const { requireRole } = require('../middleware/requireRole');
const { genericPasswordFor } = require('../utils/genericPassword');

const router = express.Router();
const SALT_ROUNDS = 10;

const PUBLIC_COLUMNS = 'id, dni, nombre, rol, estado, debe_cambiar_password, sede_id, creado_en, actualizado_en';

router.get('/', requireRole('admin'), async (req, res) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM usuarios WHERE rol = 'empleado' ORDER BY nombre`
  );
  res.json(rows);
});

router.post('/', requireRole('admin'), async (req, res) => {
  const { dni, nombre, sedeId, horarioInicial } = req.body;
  if (!dni || !nombre || !sedeId) {
    return res.status(400).json({ error: 'dni, nombre y sedeId son requeridos.' });
  }

  const passwordHash = await bcrypt.hash(genericPasswordFor(dni), SALT_ROUNDS);

  try {
    const { rows } = await query(
      `INSERT INTO usuarios (dni, nombre, password_hash, rol, sede_id, debe_cambiar_password)
       VALUES ($1, $2, $3, 'empleado', $4, true) RETURNING ${PUBLIC_COLUMNS}`,
      [dni, nombre, passwordHash, sedeId]
    );
    const empleado = rows[0];

    if (horarioInicial) {
      const h = horarioInicial;
      await query(
        `INSERT INTO horarios (empleado_id, dias_semana, hora_entrada, hora_salida, hora_inicio_almuerzo, hora_fin_almuerzo, tolerancia_minutos)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          empleado.id,
          h.diasSemana,
          h.horaEntrada,
          h.horaSalida,
          h.horaInicioAlmuerzo || null,
          h.horaFinAlmuerzo || null,
          h.toleranciaMinutos ?? 10,
        ]
      );
    }

    res.status(201).json(empleado);
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

router.patch('/:id/sede', requireRole('admin'), async (req, res) => {
  const { sedeId } = req.body;
  if (!sedeId) return res.status(400).json({ error: 'sedeId es requerido.' });
  const { rows } = await query(
    `UPDATE usuarios SET sede_id = $1, actualizado_en = now() WHERE id = $2 AND rol = 'empleado'
     RETURNING ${PUBLIC_COLUMNS}`,
    [sedeId, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Empleado no encontrado.' });
  res.json(rows[0]);
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
