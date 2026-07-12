'use strict';

const { z } = require('zod');

// ── Enum values mirroring the DB driver_status enum ──────────────────────────
const driverStatusEnum = z.enum(['available', 'on_trip', 'off_duty', 'suspended']);

/**
 * Schema for POST /api/drivers
 */
const createDriverSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .min(1, 'Name cannot be empty.'),
  license_number: z
    .string({ required_error: 'License number is required.' })
    .min(1, 'License number cannot be empty.'),
  license_category: z
    .string({ required_error: 'License category is required.' })
    .min(1, 'License category cannot be empty.'),
  license_expiry_date: z
    .string({ required_error: 'License expiry date is required.' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'License expiry date must be a valid date string (e.g. 2027-06-30).',
    })
    .transform((val) => new Date(val)),
  contact_number: z
    .string({ required_error: 'Contact number is required.' })
    .min(1, 'Contact number cannot be empty.'),
  safety_score: z
    .number({ invalid_type_error: 'Safety score must be a number.' })
    .int('Safety score must be an integer.')
    .min(0, 'Safety score must be between 0 and 100.')
    .max(100, 'Safety score must be between 0 and 100.')
    .optional(),
});

/**
 * Schema for PUT /api/drivers/:id/status
 */
const updateDriverStatusSchema = z.object({
  status: driverStatusEnum,
});

module.exports = { createDriverSchema, updateDriverStatusSchema };
