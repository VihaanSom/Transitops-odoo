'use strict';

const { z } = require('zod');

// ── Enum values mirroring the DB vehicle_status enum ─────────────────────────
const vehicleStatusEnum = z.enum(['available', 'on_trip', 'in_shop', 'retired']);

/**
 * Schema for POST /api/vehicles
 * Creates a new vehicle in the registry.
 */
const createVehicleSchema = z.object({
  registration_number: z
    .string({ required_error: 'Registration number is required.' })
    .min(1, 'Registration number cannot be empty.'),
  name_model: z
    .string({ required_error: 'Vehicle name/model is required.' })
    .min(1, 'Vehicle name/model cannot be empty.'),
  vehicle_type: z
    .string({ required_error: 'Vehicle type is required.' })
    .min(1, 'Vehicle type cannot be empty.'),
  max_load_capacity: z
    .number({ required_error: 'Max load capacity is required.', invalid_type_error: 'Max load capacity must be a number.' })
    .positive('Max load capacity must be greater than 0.'),
  odometer: z
    .number({ invalid_type_error: 'Odometer must be a number.' })
    .min(0, 'Odometer must be 0 or greater.')
    .optional()
    .default(0),
  acquisition_cost: z
    .number({ required_error: 'Acquisition cost is required.', invalid_type_error: 'Acquisition cost must be a number.' })
    .min(0, 'Acquisition cost must be 0 or greater.'),
});

/**
 * Schema for PUT /api/vehicles/:id
 * Updates an existing vehicle — all fields optional.
 */
const updateVehicleSchema = z.object({
  name_model: z.string().min(1).optional(),
  vehicle_type: z.string().min(1).optional(),
  max_load_capacity: z.number().positive().optional(),
  odometer: z.number().min(0).optional(),
  acquisition_cost: z.number().min(0).optional(),
  status: vehicleStatusEnum.optional(),
}).strict();

/**
 * Schema for POST /api/vehicles/:id/documents
 */
const addDocumentSchema = z.object({
  document_type: z
    .string({ required_error: 'Document type is required.' })
    .min(1, 'Document type cannot be empty.'),
  file_url: z
    .string({ required_error: 'File URL is required.' })
    .url('File URL must be a valid URL.'),
});

module.exports = { createVehicleSchema, updateVehicleSchema, addDocumentSchema };
