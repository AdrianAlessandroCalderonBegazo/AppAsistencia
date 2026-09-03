const express = require('express');
const { query } = require('../db');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.get('/', async (req, res) => {
  const { rows } = await query('SELECT * FROM empresas_sedes ORDER BY nombre');
  res.json(rows);
});

router.post('/', requireRole('admin'), async (req, res) => {
  const { nombre, latitud, longitud, radioMetros } = req.body;
  if (!nombre || latitud === undefined || longitud === undefined) {
    return res.status(400).json({ error: 'nombre, latitud y longitud son requeridos.' });
  }
  const { rows } = await query(
    `INSERT INTO empresas_sedes (nombre, latitud, longitud, radio_metros) VALUES ($1,$2,$3,$4) RETURNING *`,
    [nombre, latitud, longitud, radioMetros ?? 100]
  );
  res.status(201).json(rows[0]);
});

router.patch('/:id', requireRole('admin'), async (req, res) => {
  const campoPorClave = { nombre: 'nombre', latitud: 'latitud', longitud: 'longitud', radioMetros: 'radio_metros' };
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
    `UPDATE empresas_sedes SET ${sets.join(', ')}, actualizado_en = now() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Sede no encontrada.' });
  res.json(rows[0]);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { rows } = await query('DELETE FROM empresas_sedes WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Sede no encontrada.' });
  res.json({ message: 'Sede eliminada.' });
});

module.exports = router;
