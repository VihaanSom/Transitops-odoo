'use strict';

const { z } = require('zod');

// ── Create Trip ──────────────────────────────────────────────────────────────
const createTripSchema = z.object({
  source: z.string().min(1, 'Source is required').max(255),
  destination: z.string().min(1, 'Destination is required').max(255),
  // Use coerce so string IDs sent from the frontend ('1', '2') are auto-cast to integers
  vehicle_id: z.coerce.number().int().positive('vehicle_id must be a positive integer'),
  driver_id: z.coerce.number().int().positive('driver_id must be a positive integer'),
  cargo_weight: z
    .number()
    .positive('cargo_weight must be greater than 0'),
  planned_distance: z
    .number()
    .positive('planned_distance must be greater than 0'),
  start_odometer: z
    .number()
    .nonnegative('start_odometer must be >= 0')
    .optional(),
  scheduled_at: z
    .string()
    .datetime({ message: 'scheduled_at must be a valid ISO 8601 datetime' })
    .optional(),
});

// ── Dispatch Trip ────────────────────────────────────────────────────────────
const dispatchTripSchema = z.object({
  dispatched_at: z
    .string()
    .datetime({ message: 'dispatched_at must be a valid ISO 8601 datetime' })
    .optional(),
});

// ── Complete Trip ────────────────────────────────────────────────────────────
const completeTripSchema = z.object({
  final_odometer: z
    .number()
    .nonnegative('final_odometer must be >= 0')
    .optional(),
  revenue: z
    .number()
    .nonnegative('revenue must be >= 0')
    .optional(),
  completed_at: z
    .string()
    .datetime({ message: 'completed_at must be a valid ISO 8601 datetime' })
    .optional(),
});

// ── Cancel Trip ──────────────────────────────────────────────────────────────
const cancelTripSchema = z.object({
  cancelled_at: z
    .string()
    .datetime({ message: 'cancelled_at must be a valid ISO 8601 datetime' })
    .optional(),
});

module.exports = {
  createTripSchema,
  dispatchTripSchema,
  completeTripSchema,
  cancelTripSchema,
};
