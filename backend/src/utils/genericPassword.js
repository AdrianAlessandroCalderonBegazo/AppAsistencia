// Regla documentada en .env.example: primeros 4 dígitos del DNI + "Asis".
// Ej: DNI "12345678" -> "1234Asis". Centralizada aquí para que crear y resetear
// cuentas usen siempre la misma contraseña genérica.
function genericPasswordFor(dni) {
  const digits = String(dni).replace(/\D/g, '').padEnd(4, '0').slice(0, 4);
  return `${digits}Asis`;
}

module.exports = { genericPasswordFor };
