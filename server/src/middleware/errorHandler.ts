import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  const message = err instanceof Error ? err.message : 'Something went wrong';
  console.log('err: ', err);
  res.status(500).json({ message });
}
