'use strict';

const jwt = require('jsonwebtoken');

/**
 * verifyToken — Extracts and verifies the JWT from the Authorization header.
 *
 * Expects: Authorization: Bearer <token>
 * On success: attaches req.user = { id, role } and calls next().
 * On failure: returns 401 Unauthorized.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * requireRole — RBAC middleware factory.
 *
 * Usage: requireRole('Fleet Manager', 'Dispatcher')
 * Returns 403 Forbidden if req.user.role is not in the allowed list.
 *
 * @param {...string} roles - One or more allowed role strings.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
