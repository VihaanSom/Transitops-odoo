'use strict';

const { z } = require('zod');

// ── Create Maintenance Log ────────────────────────────────────────────────────
const createMaintenanceSchema = z.object({
  vehicle_id: z.number().int().positive('vehicle_id must be a positive integer'),
  description: z.string().min(1, 'Description is required').max(1000),
});

// ── Close Maintenance Log ─────────────────────────────────────────────────────
const closeMaintenanceSchema = z.object({
  cost: z
    .number()
    .nonnegative('cost must be >= 0'),
  closed_at: z
    .string()
    .datetime({ message: 'closed_at must be a valid ISO 8601 datetime' })
    .optional(),
});

module.exports = { createMaintenanceSchema, closeMaintenanceSchema };
