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

// /auth se monta antes de requirePasswordChanged: login, refresh y change-password deben
// funcionar aunque el usuario todavía tenga debe_cambiar_password = true.
app.use('/auth', authRoutes);

app.use(authenticate, requirePasswordChanged);

app.use('/employees', employeeRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/requests', requestRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/sites', siteRoutes);
app.use('/reports', reportRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

module.exports = app;
