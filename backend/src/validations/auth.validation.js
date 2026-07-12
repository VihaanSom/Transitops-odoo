'use strict';

const { z } = require('zod');

/**
 * Schema for POST /api/auth/login
 */
const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required.' }).email('Must be a valid email address.'),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password cannot be empty.'),
});

module.exports = { loginSchema };
