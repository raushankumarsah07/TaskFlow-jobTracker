import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors = [];

    if (err.name === 'ValidationError') {
      statusCode = 422;
      message = 'Validation Error';
      errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    } else if (err.code === 11000) {
      statusCode = 409;
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      message = `${field} already exists`;
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    error = new ApiError(statusCode, message, errors, err.stack);
  }

  logger.error(
    `${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors?.length ? error.errors : undefined,
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  });
};
