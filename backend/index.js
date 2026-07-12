require('dotenv').config();
const express = require('express');

const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/vehicles', require('./src/routes/vehicle.routes'));
app.use('/api/drivers', require('./src/routes/driver.routes'));
app.use('/api/trips', require('./src/routes/trip.routes'));
app.use('/api/maintenance', require('./src/routes/maintenance.routes'));
app.use('/api/expenses', require('./src/routes/expense.routes'));
app.use('/api/reports', require('./src/routes/report.routes'));

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
