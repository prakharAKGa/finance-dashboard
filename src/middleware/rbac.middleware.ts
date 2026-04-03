import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role as Role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not allowed to perform this action`
        )
      );
    }
    next();
  };
};
