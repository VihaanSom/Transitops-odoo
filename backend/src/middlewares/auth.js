'use strict';

/**
 * AUTH MIDDLEWARE STUBS
 *
 * These are temporary stubs owned by Vihaan so routes can be tested
 * independently before the teammate wires up real JWT auth.
 *
 * IMPORTANT: Replace these files with the real implementations from your
 * teammate once auth is ready. Do NOT use these stubs in production.
 */

/**
 * verifyToken — Stub: skips JWT verification, attaches a fake user to req.
 * In production this will verify the Bearer token and populate req.user.
 */
function verifyToken(req, res, next) {
  // TODO: Replace with real JWT verification
  req.user = {
    id: 1,
    role: 'Fleet Manager',
    email: 'stub@transitops.com',
  };
  next();
}

/**
 * requireRole — Stub: always grants access regardless of role.
 * In production this will compare req.user.role against the allowed roles array.
 *
 * @param {string[]} roles - Array of allowed role strings.
 */
function requireRole(roles) {
  // TODO: Replace with real RBAC check
  return (req, res, next) => {
    next();
  };
}

module.exports = { verifyToken, requireRole };
