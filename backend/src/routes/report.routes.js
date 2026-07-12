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

module.exports = router;
