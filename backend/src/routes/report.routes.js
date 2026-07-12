'use strict';

const { Router } = require('express');
const controller = require('../controllers/report.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');

const router = Router();

// GET /api/reports/vehicle-analytics — full vehicle ROI analytics from the view
router.get(
  '/vehicle-analytics',
  verifyToken,
  requireRole('Financial Analyst', 'Fleet Manager'),
  controller.getVehicleAnalytics,
);

// GET /api/reports/monthly-revenue — completed trip revenue aggregated by month
router.get(
  '/monthly-revenue',
  verifyToken,
  requireRole('Financial Analyst', 'Fleet Manager'),
  controller.getMonthlyRevenue,
);

module.exports = router;
