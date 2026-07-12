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
      first_name: user.first_name,
      last_name: user.last_name,
    },
  };
}

/**
 * Registers a new user.
 *
 * @param {{ email: string, password: string, role: string }} data
 * @returns {{ user: { id: number, role: string, email: string } }}
 */
async function register(data) {
  const password_hash = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.users.create({
    data: {
      email: data.email,
      role: data.role,
      password_hash,
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
    },
  });

  return {
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  };
}

/**
 * Deletes a user account.
 *
 * @param {number} id
 */
async function deleteAccount(id) {
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return prisma.users.delete({ where: { id } });
}

/**
 * Fetches the user profile by ID.
 */
async function getProfile(id) {
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}

/**
 * Updates the user's profile names.
 */
async function updateProfile(id, data) {
  const user = await prisma.users.update({
    where: { id },
    data: {
      first_name: data.first_name !== undefined ? data.first_name : undefined,
      last_name: data.last_name !== undefined ? data.last_name : undefined,
    }
  });

  return {
    id: user.id,
    role: user.role,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}

module.exports = { login, register, deleteAccount, getProfile, updateProfile };
