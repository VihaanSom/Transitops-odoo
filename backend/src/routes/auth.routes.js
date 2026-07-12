'use strict';

const { Router } = require('express');
const validate = require('../middlewares/validate');
const { loginSchema } = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');

const router = Router();

/**
 * POST /api/auth/login
 * Public — no auth middleware required.
 */
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
