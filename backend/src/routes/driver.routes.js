'use strict';

const { Router } = require('express');
const { verifyToken, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createDriverSchema, updateDriverStatusSchema } = require('../validations/driver.validation');
const driverController = require('../controllers/driver.controller');

const router = Router();

// All driver routes require authentication
router.use(verifyToken);

/**
 * GET /api/drivers
 * Access: Fleet Manager, Safety Officer
 * (Dispatcher = no access per RBAC table)
 */
router.get(
  '/',
  requireRole('Fleet Manager', 'Safety Officer'),
  driverController.getAllDrivers,
);

/**
 * POST /api/drivers
 * Access: Fleet Manager, Safety Officer
 */
router.post(
  '/',
  requireRole('Fleet Manager', 'Safety Officer'),
  validate(createDriverSchema),
  driverController.createDriver,
);

/**
 * GET /api/drivers/:id
 * Access: Fleet Manager, Safety Officer
 */
router.get(
  '/:id',
  requireRole('Fleet Manager', 'Safety Officer'),
  driverController.getDriverById,
);

/**
 * PUT /api/drivers/:id/status
 * Access: Safety Officer only (manual suspensions / status corrections)
 */
router.put(
  '/:id/status',
  requireRole('Safety Officer'),
  validate(updateDriverStatusSchema),
  driverController.updateStatus,
);

/**
 * DELETE /api/drivers/:id
 * Access: Fleet Manager, Safety Officer
 */
router.delete(
  '/:id',
  requireRole('Fleet Manager', 'Safety Officer'),
  driverController.deleteDriver,
);

module.exports = router;
