import type { Request, Response, NextFunction } from 'express';
import { getCurrentUser } from '../services/authService';
import { ApiError } from '../utils/ApiError';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing authentication token');
    }

    const token = authHeader.slice('Bearer '.length);
    const currentUser = await getCurrentUser(token);

    if (currentUser.id !== Number(req.params.userId)) {
      throw new ApiError(403, "Cannot access another user's cart");
    }

    next();
  } catch (err) {
    next(err);
  }
}
