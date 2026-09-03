const express = require('express');
const cors = require('cors');

const { authenticate } = require('./middleware/auth');
const { requirePasswordChanged } = require('./middleware/requirePasswordChanged');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const requestRoutes = require('./routes/requests');
const scheduleRoutes = require('./routes/schedules');
const siteRoutes = require('./routes/sites');
const reportRoutes = require('./routes/reports');

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Todas las rutas de negocio quedan bajo /api — es lo que esperan admin-web y mobile-app
// (VITE_API_URL / API_BASE_URL apuntan a ".../api"). /health queda fuera a propósito, es lo
// que suelen pegar los health checks de Render sin conocer el prefijo de la app.
const api = express.Router();

// /auth se monta antes de requirePasswordChanged: login, refresh y change-password deben
// funcionar aunque el usuario todavía tenga debe_cambiar_password = true.
api.use('/auth', authRoutes);

api.use(authenticate, requirePasswordChanged);

api.use('/employees', employeeRoutes);
api.use('/attendance', attendanceRoutes);
api.use('/requests', requestRoutes);
api.use('/schedules', scheduleRoutes);
api.use('/sites', siteRoutes);
api.use('/reports', reportRoutes);

app.use('/api', api);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

module.exports = app;
