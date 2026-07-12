'use strict';

const { ZodError } = require('zod');

/**
 * Parses a raw PostgreSQL RAISE EXCEPTION message out of a Prisma error.
 * Prisma wraps trigger exceptions inside PrismaClientUnknownRequestError or
 * PrismaClientKnownRequestError with code P2010/P2035.
 * The actual message from the trigger sits inside the `cause` chain.
 */
function extractTriggerMessage(err) {
  // Walk the error cause chain looking for the raw PG error message
  let current = err;
  while (current) {
    const msg = current.message || '';
    // PostgreSQL RAISE EXCEPTION messages surface here
    const match = msg.match(/ERROR:\s+(.+?)(?:\n|$)/i);
    if (match) return match[1].trim();
    current = current.cause;
  }
  return null;
}

/**
 * Global Express error handler middleware.
 *
 * Handles:
 *  - ZodError           → 400 with field-level details
 *  - PostgreSQL trigger RAISE EXCEPTION (via Prisma) → 400 with clean message
 *  - Prisma P2025 (not found) → 404
 *  - Everything else    → 500
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // ── Zod validation errors ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // ── Prisma / PostgreSQL errors ────────────────────────────────────────────
  if (err.constructor?.name?.startsWith('PrismaClient')) {
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ error: err.meta?.cause || 'Record not found.' });
    }

    // Raw query / trigger exception — codes P2010, P2035, or unknown request
    const triggerMessage = extractTriggerMessage(err);
    if (triggerMessage) {
      return res.status(400).json({ error: triggerMessage });
    }

    // Unique constraint violation
    if (err.code === 'P2002') {
      const fields = err.meta?.target?.join(', ') || 'field';
      return res.status(409).json({ error: `A record with this ${fields} already exists.` });
    }

    // Foreign key constraint failure
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Referenced record does not exist.' });
    }

    // Generic Prisma error — log internally, return safe message
    console.error('[Prisma Error]', err);
    return res.status(500).json({ error: 'A database error occurred.' });
  }

  // ── HTTP errors with explicit statusCode ──────────────────────────────────
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // ── Unhandled errors ──────────────────────────────────────────────────────
  console.error('[Unhandled Error]', err);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
}

module.exports = errorHandler;
