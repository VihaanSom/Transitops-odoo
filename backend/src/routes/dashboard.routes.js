'use strict';

const { Router } = require('express');
const { verifyToken } = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboard.controller');

const router = Router();

// All dashboard routes require authentication (any role)
router.use(verifyToken);

/**
 * GET /api/dashboard/kpis
 * Access: All authenticated roles.
 * Returns fleet-wide KPI aggregates.
 */
router.get('/kpis', dashboardController.getKpis);

/**
 * GET /api/dashboard/recent-trips
 * Access: All authenticated roles.
 * Returns the 5 most recent trips for the dashboard activity widget.
 * Bypasses /trips RBAC — this is a dashboard-scoped read-only view.
 */
router.get('/recent-trips', dashboardController.getRecentTrips);

module.exports = router;
