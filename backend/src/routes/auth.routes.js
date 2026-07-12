'use strict';

const { Router } = require('express');
const validate = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');
const { loginSchema, registerSchema } = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');

const router = Router();

/**
 * POST /api/auth/login
 * Public — no auth middleware required.
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * POST /api/auth/register
 * Public — creates a new user account.
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * DELETE /api/auth/me
 * Requires authentication. Deletes the current user's account.
 */
router.delete('/me', verifyToken, authController.deleteAccount);

module.exports = router;
