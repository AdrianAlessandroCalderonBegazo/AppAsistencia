const express = require('express');
const { query } = require('../db');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();
router.use(requireRole('admin'));

router.get('/employee/:empleadoId', async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM horarios WHERE empleado_id = $1 ORDER BY creado_en DESC',
    [req.params.empleadoId]
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { empleadoId, diasSemana, horaEntrada, horaSalida, horaInicioAlmuerzo, horaFinAlmuerzo, toleranciaMinutos } = req.body;
  if (!empleadoId || !diasSemana || !horaEntrada || !horaSalida) {
    return res.status(400).json({ error: 'empleadoId, diasSemana, horaEntrada y horaSalida son requeridos.' });
  }

  const { rows } = await query(
    `INSERT INTO horarios (empleado_id, dias_semana, hora_entrada, hora_salida, hora_inicio_almuerzo, hora_fin_almuerzo, tolerancia_minutos)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [empleadoId, diasSemana, horaEntrada, horaSalida, horaInicioAlmuerzo || null, horaFinAlmuerzo || null, toleranciaMinutos ?? 10]
  );
  res.status(201).json(rows[0]);
});

router.patch('/:id', async (req, res) => {
  const campoPorClave = {
    diasSemana: 'dias_semana', horaEntrada: 'hora_entrada', horaSalida: 'hora_salida',
    horaInicioAlmuerzo: 'hora_inicio_almuerzo', horaFinAlmuerzo: 'hora_fin_almuerzo',
    toleranciaMinutos: 'tolerancia_minutos', activo: 'activo',
  };
  const sets = [];
  const params = [];
  for (const [clave, valor] of Object.entries(req.body)) {
    const columna = campoPorClave[clave];
    if (!columna) continue;
    params.push(valor);
    sets.push(`${columna} = $${params.length}`);
  }
  if (sets.length === 0) return res.status(400).json({ error: 'No se enviaron campos válidos.' });

  params.push(req.params.id);
  const { rows } = await query(
    `UPDATE horarios SET ${sets.join(', ')}, actualizado_en = now() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Horario no encontrado.' });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { rows } = await query('UPDATE horarios SET activo = false WHERE id = $1 RETURNING *', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Horario no encontrado.' });
  res.json({ message: 'Horario desactivado.' });
});

module.exports = router;
