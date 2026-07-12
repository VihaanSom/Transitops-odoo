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

// GET  /api/trips          — list all trips
// Access: Dispatcher (full), Safety Officer (view only)
router.get(
  '/',
  verifyToken,
  requireRole('Dispatcher', 'Safety Officer'),
  controller.getAllTrips,
);

// GET  /api/trips/:id      — single trip detail
// Access: Dispatcher (full), Safety Officer (view only)
router.get(
  '/:id',
  verifyToken,
  requireRole('Dispatcher', 'Safety Officer'),
  controller.getTripById,
);

// POST /api/trips          — create trip in draft status
// Access: Dispatcher only
router.post(
  '/',
  verifyToken,
  requireRole('Dispatcher'),
  validate(createTripSchema),
  controller.createTrip,
);

// PATCH /api/trips/:id/dispatch — dispatch a draft trip
// Access: Dispatcher only
router.patch(
  '/:id/dispatch',
  verifyToken,
  requireRole('Dispatcher'),
  validate(dispatchTripSchema),
  controller.dispatchTrip,
);

// PATCH /api/trips/:id/complete — mark trip as completed
// Access: Dispatcher only
router.patch(
  '/:id/complete',
  verifyToken,
  requireRole('Dispatcher'),
  validate(completeTripSchema),
  controller.completeTrip,
);

// PATCH /api/trips/:id/cancel — cancel a trip
// Access: Dispatcher only
router.patch(
  '/:id/cancel',
  verifyToken,
  requireRole('Dispatcher'),
  validate(cancelTripSchema),
  controller.cancelTrip,
);

module.exports = router;
