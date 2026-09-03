const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, dni: user.dni, rol: user.rol, debe_cambiar_password: user.debe_cambiar_password },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '2h' }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
}

router.post('/login', async (req, res) => {
  const { dni, password } = req.body;
  if (!dni || !password) return res.status(400).json({ error: 'DNI y contraseña son requeridos.' });

  const { rows } = await query('SELECT * FROM usuarios WHERE dni = $1', [dni]);
  const user = rows[0];
  if (!user || user.estado !== 'activo') {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) return res.status(401).json({ error: 'Credenciales inválidas.' });

  res.json({
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    debeCambiarPassword: user.debe_cambiar_password,
    usuario: { id: user.id, dni: user.dni, nombre: user.nombre, rol: user.rol, sedeId: user.sede_id },
  });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken es requerido.' });

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Refresh token inválido o expirado.' });
  }

  const { rows } = await query('SELECT * FROM usuarios WHERE id = $1', [payload.id]);
  const user = rows[0];
  if (!user || user.estado !== 'activo') return res.status(401).json({ error: 'Usuario no disponible.' });

  res.json({ accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) });
});

// Único endpoint accesible aun cuando debe_cambiar_password sea true (montado antes del middleware
// requirePasswordChanged en app.js).
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword y newPassword son requeridos.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
  }

  const { rows } = await query('SELECT * FROM usuarios WHERE id = $1', [req.user.id]);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const passwordOk = await bcrypt.compare(currentPassword, user.password_hash);
  if (!passwordOk) return res.status(401).json({ error: 'Contraseña actual incorrecta.' });

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const { rows: updatedRows } = await query(
    `UPDATE usuarios SET password_hash = $1, debe_cambiar_password = false, actualizado_en = now()
     WHERE id = $2 RETURNING *`,
    [newHash, user.id]
  );
  const updated = updatedRows[0];

  res.json({
    message: 'Contraseña actualizada correctamente.',
    accessToken: signAccessToken(updated),
    refreshToken: signRefreshToken(updated),
  });
});

module.exports = router;
