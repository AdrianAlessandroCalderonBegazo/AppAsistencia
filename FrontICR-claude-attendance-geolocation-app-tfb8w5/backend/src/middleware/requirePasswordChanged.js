// Bloquea el uso de la API mientras debe_cambiar_password sea true, salvo el propio
// endpoint de cambio de contraseña (excluido explícitamente por la ruta que lo monta antes).
function requirePasswordChanged(req, res, next) {
  if (req.user && req.user.debe_cambiar_password) {
    return res.status(403).json({
      error: 'Debes cambiar tu contraseña antes de continuar.',
      code: 'PASSWORD_CHANGE_REQUIRED',
    });
  }
  next();
}

module.exports = { requirePasswordChanged };
