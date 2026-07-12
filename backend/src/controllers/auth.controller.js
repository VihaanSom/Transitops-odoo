'use strict';

const authService = require('../services/auth.service');

/**
 * POST /api/auth/login
 * Body is already validated by the validate(loginSchema) middleware.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
