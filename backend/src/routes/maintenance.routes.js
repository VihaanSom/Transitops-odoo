'use strict';

const { Router } = require('express');
const controller = require('../controllers/maintenance.controller');
const validate = require('../middlewares/validate');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { createMaintenanceSchema, closeMaintenanceSchema } = require('../validations/maintenance.validation');

const router = Router();

// GET  /api/maintenance        — list all maintenance logs (optional ?status=open|closed)
router.get(
  '/',
  verifyToken,
  requireRole('Fleet Manager', 'Financial Analyst'),
  controller.getAllMaintenance,
);

// GET  /api/maintenance/:id    — single maintenance log detail
router.get(
  '/:id',
  verifyToken,
  requireRole('Fleet Manager', 'Financial Analyst'),
  controller.getMaintenanceById,
);

// POST /api/maintenance        — open a new maintenance log
// DB trigger auto-sets vehicle → in_shop. Rejects if vehicle not available.
router.post(
  '/',
  verifyToken,
  requireRole('Fleet Manager'),
  validate(createMaintenanceSchema),
  controller.createMaintenance,
);

// PATCH /api/maintenance/:id/close — close an open maintenance log
// DB trigger auto-restores vehicle → available.
router.patch(
  '/:id/close',
  verifyToken,
  requireRole('Fleet Manager'),
  validate(closeMaintenanceSchema),
  controller.closeMaintenance,
);

module.exports = router;
