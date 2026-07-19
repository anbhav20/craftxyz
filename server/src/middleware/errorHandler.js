import { ApiError } from '../utils/ApiError.js';

/**
 * 404 handler — must be mounted after all routes, before errorHandler.
 */
export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Single place all errors funnel through. Anything thrown (or passed to
 * next()) anywhere in the app ends up here.
 */
export function errorHandler(err, req, res, next) {
  let error = err;

  // Normalize known non-ApiError cases into ApiError so the response
  // shape is always consistent.
  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      // Mongoose schema validation
      error = ApiError.badRequest('Validation failed', error.errors);
    } else if (error.name === 'CastError') {
      // Malformed ObjectId etc.
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    } else if (error.code === 11000) {
      // Mongo duplicate key
      const field = Object.keys(error.keyValue || {})[0];
      error = ApiError.conflict(`${field ? `${field} already exists` : 'Duplicate value'}`);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Invalid or expired token');
    } else if (error.name === 'MulterError') {
      const messages = {
        LIMIT_FILE_SIZE: 'File too large (max 5MB per image)',
        LIMIT_FILE_COUNT: 'Too many files (max 6 images)',
        LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
      };
      error = ApiError.badRequest(messages[error.code] || 'File upload error');
    } else {
      error = new ApiError(500, error.message || 'Internal server error');
    }
  }

  if (!error.isOperational || error.statusCode >= 500) {
    // Only log unexpected/server errors loudly — expected 4xx are noise.
    console.error('[error]', err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    details: error.details ?? undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
