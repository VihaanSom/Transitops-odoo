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

/**
 * POST /api/auth/register
 * Body is already validated by the validate(registerSchema) middleware.
 */
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/auth/me
 * Deletes the currently authenticated user's account.
 */
async function deleteAccount(req, res, next) {
  try {
    const id = req.user.id;
    await authService.deleteAccount(id);
    return res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Gets the currently authenticated user's profile.
 */
async function getProfile(req, res, next) {
  try {
    const id = req.user.id;
    const profile = await authService.getProfile(id);
    return res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/me
 * Updates the currently authenticated user's profile.
 */
async function updateProfile(req, res, next) {
  try {
    const id = req.user.id;
    const profile = await authService.updateProfile(id, req.body);
    return res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, deleteAccount, getProfile, updateProfile };
