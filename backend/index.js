require('dotenv').config();
const express = require('express');
const errorHandler = require('./src/middlewares/errorHandler');

// Prisma client is initialised in src/config/prisma.js and imported by services.
// We require it here once to ensure the connection is established on startup.
require('./src/config/prisma');

const app = express();
const PORT = process.env.PORT || 3000;

//Global middleware
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/trips', require('./src/routes/trip.routes'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
