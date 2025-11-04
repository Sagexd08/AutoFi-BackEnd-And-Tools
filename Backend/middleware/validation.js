/**
 * Validation middleware for Express using Zod schemas.
 */

/**
 * Creates a validation middleware for request body validation.
 * 
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export function validateBody(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body validation failed',
            details: error.errors,
            timestamp: new Date().toISOString(),
          },
        });
      }
      next(error);
    }
  };
}

/**
 * Creates a validation middleware for query parameters validation.
 * 
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export function validateQuery(schema) {
  return async (req, res, next) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameters validation failed',
            details: error.errors,
            timestamp: new Date().toISOString(),
          },
        });
      }
      next(error);
    }
  };
}

/**
 * Creates a validation middleware for route parameters validation.
 * 
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export function validateParams(schema) {
  return async (req, res, next) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Route parameters validation failed',
            details: error.errors,
            timestamp: new Date().toISOString(),
          },
        });
      }
      next(error);
    }
  };
}
