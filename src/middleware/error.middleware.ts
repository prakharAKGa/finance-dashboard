import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from './logger.middleware';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      ApiResponse.error(err.message)
    );
  }

  // Prisma errors
  if ((err as any).code === 'P2002') {
    return res.status(409).json(
      ApiResponse.error('A record with this value already exists')
    );
  }

  return res.status(500).json(
    ApiResponse.error(
      config.nodeEnv === 'production'
        ? 'Internal server error'
        : err.message
    )
  );
};
