import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map(
          (e: any) => `${e.path.join('.')}: ${e.message}`
        );
        return next(ApiError.badRequest('Validation failed', errors));
      }
      next(err);
    }
  };
