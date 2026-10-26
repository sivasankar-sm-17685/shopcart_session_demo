import type { Request, Response, NextFunction } from 'express';
import { getUserFromSession } from '../services/authService';
import { ApiError } from '../utils/apiError';
import { SESSION_COOKIE_NAME } from '../config/cookie';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const cookie = req.cookies[SESSION_COOKIE_NAME];
    if (!cookie) {
      throw new ApiError(401, 'Missing authentication token');
    }
    const user = getUserFromSession(cookie);
    req.userId = user.id;
    next();
  } catch (err) {
    next(err);
  }
}
