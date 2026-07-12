'use strict';

const { ZodError } = require('zod');

/**
 * Middleware factory for Zod schema validation.
 *
 * Usage:
 *   router.post('/', validate(myZodSchema), myController);
 *
 * Validates req.body against the provided schema.
 * On success: attaches the parsed (coerced/stripped) data to req.body and calls next().
 * On failure: calls next() with a ZodError which the global errorHandler will format.
 *
 * @param {import('zod').ZodTypeAny} schema
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(err);
      } else {
        next(err);
      }
    }
  };
}

module.exports = validate;
