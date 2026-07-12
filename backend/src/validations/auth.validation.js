'use strict';

const { z } = require('zod');

/**
 * Schema for POST /api/auth/login
 */
const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required.' }).email('Must be a valid email address.'),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password cannot be empty.'),
});

/**
 * Schema for POST /api/auth/register
 */
const registerSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string({ required_error: 'Email is required.' }).email('Must be a valid email address.'),
  password: z.string({ required_error: 'Password is required.' }).min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['Fleet Manager', 'Safety Officer', 'Dispatcher', 'Financial Analyst'], {
    errorMap: () => ({ message: 'Invalid role. Must be Fleet Manager, Safety Officer, Dispatcher, or Financial Analyst.' })
  }),
});

/**
 * Schema for PUT /api/auth/me
 */
const updateProfileSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
});

module.exports = { loginSchema, registerSchema, updateProfileSchema };
