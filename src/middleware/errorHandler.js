/* ============================================================
   src/middleware/errorHandler.js
   Global Express error-handling middleware.
   Must have exactly 4 parameters (err, req, res, next) so
   Express recognises it as an error handler.
   ============================================================ */

'use strict';

/**
 * Catches any error thrown (or passed via next(err)) in a
 * controller and returns a consistent JSON error response.
 * This prevents the server from crashing on unexpected errors.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message || err);

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    error:   err.message || 'Internal Server Error',
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
