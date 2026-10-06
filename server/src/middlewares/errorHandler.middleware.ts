import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'APP_ERROR';
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Prisma database errors
    statusCode = 400;
    message = 'Database constraint error or invalid operation';
    code = 'DATABASE_ERROR';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token is invalid or expired';
    code = 'TOKEN_INVALID';
  } else {
    // Unhandled exception
    logger.error(`Unhandled Error: ${err.message}`, {
      path: req.path,
      method: req.method,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(env.NODE_ENV === 'development' && { details: err.message, stack: err.stack }),
    },
  });
};
