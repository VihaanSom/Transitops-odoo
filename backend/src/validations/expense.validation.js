'use strict';

const { z } = require('zod');

// ── Create Fuel Log ───────────────────────────────────────────────────────────
const createFuelLogSchema = z.object({
  vehicle_id: z.number().int().positive('vehicle_id must be a positive integer'),
  trip_id: z.number().int().positive('trip_id must be a positive integer').optional(),
  liters: z
    .number()
    .positive('liters must be greater than 0'),
  cost: z
    .number()
    .positive('cost must be greater than 0'),
  log_date: z
    .string()
    .datetime({ message: 'log_date must be a valid ISO 8601 datetime' })
    .optional(),
});

// ── Create General Expense ────────────────────────────────────────────────────
const createExpenseSchema = z.object({
  vehicle_id: z.number().int().positive('vehicle_id must be a positive integer'),
  trip_id: z.number().int().positive('trip_id must be a positive integer').optional(),
  expense_type: z.string().min(1, 'expense_type is required').max(50),
  amount: z
    .number()
    .positive('amount must be greater than 0'),
});

module.exports = { createFuelLogSchema, createExpenseSchema };
