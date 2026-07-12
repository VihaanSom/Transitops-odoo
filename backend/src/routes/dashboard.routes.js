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

module.exports = router;
