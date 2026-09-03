const express = require('express');
const { query } = require('../db');
const { requireRole } = require('../middleware/requireRole');
const { isWithinSite } = require('../utils/geo');
const { notifyEmployeeMarkEdited } = require('../services/notifications');

const router = express.Router();

const TIPOS = ['entrada', 'salida_almuerzo', 'regreso_almuerzo', 'salida'];
const EXPECTED_ORDER = { entrada: 0, salida_almuerzo: 1, regreso_almuerzo: 2, salida: 3 };
const SELF_CORRECTION_WINDOW_MS = 10 * 60 * 1000;
const LATE_SYNC_THRESHOLD_MS = 60 * 60 * 1000;

async function getSiteForEmployee(empleadoId) {
  const { rows } = await query(
    `SELECT s.* FROM empresas_sedes s JOIN usuarios u ON u.sede_id = s.id WHERE u.id = $1`,
    [empleadoId]
  );
  return rows[0] || null;
}

// Un "es_anomalia" no bloquea nada: el cliente ya confirmó con el usuario. El servidor solo
// registra la marca y deja constancia de por qué es anómala (duplicado o fuera de secuencia).
async function detectAnomaly(empleadoId, fecha, tipoMarca) {
  const { rows } = await query(
    `SELECT tipo_marca FROM asistencias WHERE empleado_id = $1 AND fecha = $2 AND anulada = false ORDER BY hora_marcada`,
    [empleadoId, fecha]
  );
  const tiposDelDia = rows.map((r) => r.tipo_marca);

  if (tiposDelDia.includes(tipoMarca)) {
    return { esAnomalia: true, motivo: `Marca de tipo "${tipoMarca}" duplicada para el día.` };
  }

  const ultimoIndiceEsperado = tiposDelDia.length ? Math.max(...tiposDelDia.map((t) => EXPECTED_ORDER[t])) : -1;
  if (EXPECTED_ORDER[tipoMarca] !== ultimoIndiceEsperado + 1) {
    return { esAnomalia: true, motivo: `Marca fuera del orden esperado de la secuencia diaria.` };
  }

  return { esAnomalia: false, motivo: null };
}

async function insertMark({ empleadoId, fecha, tipoMarca, horaMarcada, lat, lng, origen }) {
  if (!TIPOS.includes(tipoMarca)) throw Object.assign(new Error('tipo_marca inválido.'), { status: 400 });

  const site = await getSiteForEmployee(empleadoId);
  if (!site) throw Object.assign(new Error('El empleado no tiene una sede asignada.'), { status: 400 });

  const { distanceMeters, withinArea } = isWithinSite(lat, lng, site);
  const { esAnomalia, motivo } = await detectAnomaly(empleadoId, fecha, tipoMarca);

  const editableHasta = new Date(new Date(horaMarcada).getTime() + SELF_CORRECTION_WINDOW_MS);
  const sincronizacionTardia = origen === 'offline_sync' && Date.now() - new Date(horaMarcada).getTime() > LATE_SYNC_THRESHOLD_MS;

  const { rows } = await query(
    `INSERT INTO asistencias
      (empleado_id, fecha, tipo_marca, hora_marcada, latitud, longitud, distancia_metros, dentro_area,
       origen, es_anomalia, motivo_anomalia, sincronizacion_tardia, editable_hasta)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      empleadoId, fecha, tipoMarca, horaMarcada, lat, lng, distanceMeters, withinArea,
      origen, esAnomalia, motivo, sincronizacionTardia, editableHasta,
    ]
  );
  return rows[0];
}

router.post('/', async (req, res) => {
  const { tipoMarca, horaMarcada, lat, lng } = req.body;
  if (tipoMarca === undefined || horaMarcada === undefined || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'tipoMarca, horaMarcada, lat y lng son requeridos.' });
  }
  const fecha = new Date(horaMarcada).toISOString().slice(0, 10);

  try {
    const marca = await insertMark({
      empleadoId: req.user.id, fecha, tipoMarca, horaMarcada, lat, lng, origen: 'normal',
    });
    res.status(201).json(marca);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }
});

// Sincronización de marcas capturadas offline. La validación de geolocalización y anomalías
// se hace en el servidor al momento de sincronizar, nunca se confía en lo enviado por el cliente.
router.post('/sync', async (req, res) => {
  const { marcas } = req.body;
  if (!Array.isArray(marcas) || marcas.length === 0) {
    return res.status(400).json({ error: 'marcas debe ser un arreglo no vacío.' });
  }

  const resultados = [];
  for (const marca of marcas) {
    const { tipoMarca, horaMarcada, lat, lng } = marca;
    if (tipoMarca === undefined || horaMarcada === undefined || lat === undefined || lng === undefined) {
      resultados.push({ error: 'Marca incompleta.', marca });
      continue;
    }
    const fecha = new Date(horaMarcada).toISOString().slice(0, 10);
    try {
      const inserted = await insertMark({
        empleadoId: req.user.id, fecha, tipoMarca, horaMarcada, lat, lng, origen: 'offline_sync',
      });
      resultados.push(inserted);
    } catch (err) {
      resultados.push({ error: err.message, marca });
    }
  }
  res.status(207).json({ resultados });
});

router.get('/history', async (req, res) => {
  const { desde, hasta } = req.query;
  const params = [req.user.id];
  let sql = 'SELECT * FROM asistencias WHERE empleado_id = $1';
  if (desde) { params.push(desde); sql += ` AND fecha >= $${params.length}`; }
  if (hasta) { params.push(hasta); sql += ` AND fecha <= $${params.length}`; }
  sql += ' ORDER BY hora_marcada DESC';

  const { rows } = await query(sql, params);
  res.json(rows);
});

// Autocorrección del propio empleado dentro de los 10 minutos posteriores a la marca.
// Pasada la ventana, debe usarse una solicitud de corrección (ver routes/requests.js).
router.delete('/:id', async (req, res) => {
  const { rows } = await query('SELECT * FROM asistencias WHERE id = $1', [req.params.id]);
  const marca = rows[0];
  if (!marca) return res.status(404).json({ error: 'Marca no encontrada.' });
  if (marca.empleado_id !== req.user.id) return res.status(403).json({ error: 'No puedes modificar marcas de otro empleado.' });
  if (!marca.editable_hasta || new Date() >= new Date(marca.editable_hasta)) {
    return res.status(403).json({
      error: 'La ventana de autocorrección (10 minutos) ya expiró. Usa una solicitud de corrección.',
      code: 'CORRECTION_WINDOW_EXPIRED',
    });
  }

  await query('UPDATE asistencias SET anulada = true WHERE id = $1', [marca.id]);
  res.json({ message: 'Marca anulada correctamente.' });
});

router.patch('/:id', async (req, res) => {
  const { lat, lng, horaMarcada } = req.body;
  const { rows } = await query('SELECT * FROM asistencias WHERE id = $1', [req.params.id]);
  const marca = rows[0];
  if (!marca) return res.status(404).json({ error: 'Marca no encontrada.' });
  if (marca.empleado_id !== req.user.id) return res.status(403).json({ error: 'No puedes modificar marcas de otro empleado.' });
  if (!marca.editable_hasta || new Date() >= new Date(marca.editable_hasta)) {
    return res.status(403).json({
      error: 'La ventana de autocorrección (10 minutos) ya expiró. Usa una solicitud de corrección.',
      code: 'CORRECTION_WINDOW_EXPIRED',
    });
  }

  const nuevaLat = lat ?? marca.latitud;
  const nuevaLng = lng ?? marca.longitud;
  const nuevaHora = horaMarcada ?? marca.hora_marcada;
  const site = await getSiteForEmployee(marca.empleado_id);
  const { distanceMeters, withinArea } = isWithinSite(nuevaLat, nuevaLng, site);

  const { rows: updatedRows } = await query(
    `UPDATE asistencias SET latitud = $1, longitud = $2, hora_marcada = $3, distancia_metros = $4, dentro_area = $5
     WHERE id = $6 RETURNING *`,
    [nuevaLat, nuevaLng, nuevaHora, distanceMeters, withinArea, marca.id]
  );
  res.json(updatedRows[0]);
});

// Corrección manual por un admin sobre una marca existente. Toda modificación queda auditada
// en correcciones_auditoria con el valor anterior y el nuevo; nunca se sobrescribe sin motivo.
router.patch('/:id/admin', requireRole('admin'), async (req, res) => {
  const { motivo, ...cambios } = req.body;
  if (!motivo) return res.status(400).json({ error: 'motivo es requerido para toda corrección administrativa.' });

  const { rows } = await query('SELECT * FROM asistencias WHERE id = $1', [req.params.id]);
  const anterior = rows[0];
  if (!anterior) return res.status(404).json({ error: 'Marca no encontrada.' });

  const campoPorClave = {
    tipoMarca: 'tipo_marca', horaMarcada: 'hora_marcada', lat: 'latitud', lng: 'longitud',
    esAnomalia: 'es_anomalia', motivoAnomalia: 'motivo_anomalia',
  };
  const sets = [];
  const params = [];
  for (const [clave, valor] of Object.entries(cambios)) {
    const columna = campoPorClave[clave];
    if (!columna) continue;
    params.push(valor);
    sets.push(`${columna} = $${params.length}`);
  }
  if (sets.length === 0) return res.status(400).json({ error: 'No se enviaron campos válidos para corregir.' });

  if (cambios.lat !== undefined || cambios.lng !== undefined) {
    const site = await getSiteForEmployee(anterior.empleado_id);
    const lat = cambios.lat ?? anterior.latitud;
    const lng = cambios.lng ?? anterior.longitud;
    const { distanceMeters, withinArea } = isWithinSite(lat, lng, site);
    params.push(distanceMeters); sets.push(`distancia_metros = $${params.length}`);
    params.push(withinArea); sets.push(`dentro_area = $${params.length}`);
  }

  params.push(req.params.id);
  const { rows: updatedRows } = await query(
    `UPDATE asistencias SET ${sets.join(', ')}, origen = 'correccion_admin' WHERE id = $${params.length} RETURNING *`,
    params
  );
  const nuevo = updatedRows[0];

  await query(
    `INSERT INTO correcciones_auditoria (asistencia_id, admin_id, valor_anterior, valor_nuevo, motivo)
     VALUES ($1, $2, $3, $4, $5)`,
    [anterior.id, req.user.id, JSON.stringify(anterior), JSON.stringify(nuevo), motivo]
  );

  await notifyEmployeeMarkEdited(nuevo, motivo);
  res.json(nuevo);
});

router.get('/employee/:empleadoId', requireRole('admin'), async (req, res) => {
  const { desde, hasta } = req.query;
  const params = [req.params.empleadoId];
  let sql = 'SELECT * FROM asistencias WHERE empleado_id = $1';
  if (desde) { params.push(desde); sql += ` AND fecha >= $${params.length}`; }
  if (hasta) { params.push(hasta); sql += ` AND fecha <= $${params.length}`; }
  sql += ' ORDER BY hora_marcada DESC';

  const { rows } = await query(sql, params);
  res.json(rows);
});

module.exports = router;
