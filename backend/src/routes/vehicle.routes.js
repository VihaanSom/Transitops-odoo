'use strict';

const { Router } = require('express');
const { verifyToken, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createVehicleSchema,
  updateVehicleSchema,
  addDocumentSchema,
} = require('../validations/vehicle.validation');
const vehicleController = require('../controllers/vehicle.controller');

const router = Router();

// All vehicle routes require authentication
router.use(verifyToken);

/**
 * GET /api/vehicles
 * Access: Fleet Manager, Dispatcher
 * Query params: ?type=Van&status=available
 */
router.get(
  '/',
  requireRole('Fleet Manager', 'Dispatcher'),
  vehicleController.getAllVehicles,
);

/**
 * POST /api/vehicles
 * Access: Fleet Manager
 */
router.post(
  '/',
  requireRole('Fleet Manager'),
  validate(createVehicleSchema),
  vehicleController.createVehicle,
);

/**
 * GET /api/vehicles/:id
 * Access: All authenticated roles
 */
router.get('/:id', vehicleController.getVehicleById);

/**
 * PUT /api/vehicles/:id
 * Access: Fleet Manager
 */
router.put(
  '/:id',
  requireRole('Fleet Manager'),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle,
);

/**
 * DELETE /api/vehicles/:id
 * Access: Fleet Manager
 * Soft-delete: sets vehicle status to 'retired'.
 */
router.delete(
  '/:id',
  requireRole('Fleet Manager'),
  vehicleController.deleteVehicle,
);

/**
 * POST /api/vehicles/:id/documents
 * Access: Fleet Manager
 */
router.post(
  '/:id/documents',
  requireRole('Fleet Manager'),
  validate(addDocumentSchema),
  vehicleController.addDocument,
);

module.exports = router;
