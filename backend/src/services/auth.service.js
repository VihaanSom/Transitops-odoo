'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Attempts to authenticate a user with the given email and password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string, user: { id: number, role: string, email: string } }}
 * @throws {{ statusCode: 401, message: string }} on invalid credentials
 */
async function login(email, password) {
  // 1. Look up user by email
  const user = await prisma.users.findUnique({ where: { email } });

  // Use a constant-time comparison path even when user doesn't exist
  // to prevent user enumeration via timing attacks.
  if (!user) {
    await bcrypt.compare(password, '$2b$10$invalidhashinvalidhashinvalidhas'); // dummy compare
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // 2. Compare password against stored hash
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // 3. Sign JWT with user id and role
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '60m' },
  );

  return {
    token,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
    },
  };
}

module.exports = { login };
