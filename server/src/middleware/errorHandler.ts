import { Request, Response, NextFunction } from 'express';
import ApiResponse from '../utils/apiResponse';
import logger from '../utils/logger';
import config from '../config/environment';

export interface ICustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { path: string; message: string }>;
  status?: number;
  path?: string;
}

/**
 * 404 Route Not Found middleware
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): Response => {
  return ApiResponse.error(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Centralized global error handling middleware
 */
export const errorHandler = (
  err: ICustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error(`Error processing request [${req.method} ${req.originalUrl}]: ${err.message}`, err);

  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  let details: unknown = null;

  // Domain & Business Logic Validation Exceptions
  if (
    message.includes('Cannot delete') ||
    message.includes('Insufficient stock') ||
    message.includes('insufficient') ||
    message.includes('already exists') ||
    message.includes('Please specify') ||
    message.includes('must be')
  ) {
    statusCode = 400;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'resource';
    message = `Duplicate field value entered: ${field} already exists.`;
    details = err.keyValue;
  }

  // Handle Mongoose Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for parameter: ${err.path || 'unknown'}`;
  }

  // Handle JSON Syntax Error in incoming body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  return ApiResponse.error(
    res,
    message,
    statusCode,
    details || (config.isDevelopment ? { debug: err.message, stack: err.stack } : null)
  );
};

export default {
  notFoundHandler,
  errorHandler
};

