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
 * Access: Safety Officer, Dispatcher
 */
router.get(
  '/',
  requireRole('Safety Officer', 'Dispatcher'),
  driverController.getAllDrivers,
);

/**
 * POST /api/drivers
 * Access: Safety Officer, Dispatcher
 */
router.post(
  '/',
  requireRole('Safety Officer', 'Dispatcher'),
  validate(createDriverSchema),
  driverController.createDriver,
);

/**
 * GET /api/drivers/:id
 * Access: Safety Officer, Dispatcher
 */
router.get(
  '/:id',
  requireRole('Safety Officer', 'Dispatcher'),
  driverController.getDriverById,
);

/**
 * PUT /api/drivers/:id/status
 * Access: Safety Officer only
 * Used for manual suspensions or status corrections.
 */
router.put(
  '/:id/status',
  requireRole('Safety Officer'),
  validate(updateDriverStatusSchema),
  driverController.updateStatus,
);

/**
 * DELETE /api/drivers/:id
 * Access: Safety Officer only
 */
router.delete(
  '/:id',
  requireRole('Safety Officer'),
  driverController.deleteDriver,
);

module.exports = router;
