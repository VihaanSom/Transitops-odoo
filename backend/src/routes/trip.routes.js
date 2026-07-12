'use strict';

const { Router } = require('express');
const controller = require('../controllers/trip.controller');
const validate = require('../middlewares/validate');
const { verifyToken, requireRole } = require('../middlewares/auth');
const {
  createTripSchema,
  dispatchTripSchema,
  completeTripSchema,
  cancelTripSchema,
} = require('../validations/trip.validation');

const router = Router();

// GET  /api/trips          — list all trips (optional ?status= filter)
router.get(
  '/',
  verifyToken,
  requireRole('Dispatcher', 'Financial Analyst'),
  controller.getAllTrips,
);

// GET  /api/trips/:id      — single trip detail
router.get(
  '/:id',
  verifyToken,
  requireRole('Dispatcher', 'Financial Analyst'),
  controller.getTripById,
);

// POST /api/trips          — create trip in draft status
router.post(
  '/',
  verifyToken,
  requireRole('Dispatcher'),
  validate(createTripSchema),
  controller.createTrip,
);

// PATCH /api/trips/:id/dispatch
router.patch(
  '/:id/dispatch',
  verifyToken,
  requireRole('Dispatcher'),
  validate(dispatchTripSchema),
  controller.dispatchTrip,
);

// PATCH /api/trips/:id/complete
router.patch(
  '/:id/complete',
  verifyToken,
  requireRole('Dispatcher'),
  validate(completeTripSchema),
  controller.completeTrip,
);

// PATCH /api/trips/:id/cancel
router.patch(
  '/:id/cancel',
  verifyToken,
  requireRole('Dispatcher'),
  validate(cancelTripSchema),
  controller.cancelTrip,
);

module.exports = router;
