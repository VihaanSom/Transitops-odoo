require('dotenv').config();
const express = require('express');

const authRoutes = require('./src/routes/auth.routes');
const vehicleRoutes = require('./src/routes/vehicle.routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/trips', require('./src/routes/trip.routes'));
app.use('/api/maintenance', require('./src/routes/maintenance.routes'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
