import type { Request, Response, NextFunction } from 'express';
import {
  getUserFromSession,
  loginUser,
  signOutUser,
  signUpUser
} from '../services/authService';
import { validateAuthCredentials } from '../utils/validation';
import { ApiError } from '../utils/apiError';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '../config/cookie';

export function signin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = validateAuthCredentials(req.body);
    const result = loginUser(username, password);
    res.cookie(SESSION_COOKIE_NAME, result.token, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json(result.user);
  } catch (err) {
    next(err);
  }
}

export function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = validateAuthCredentials(req.body);
    const result = signUpUser(username, password);
    res.cookie(SESSION_COOKIE_NAME, result.token, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json(result.user);
  } catch (err) {
    next(err);
  }
}

export function signout(req: Request, res: Response, next: NextFunction) {
  try {
    const cookie = req.cookies[SESSION_COOKIE_NAME];
    if (cookie) {
      signOutUser(cookie);
    }
    res.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export function me(req: Request, res: Response, next: NextFunction) {
  try {
    const cookie = req.cookies[SESSION_COOKIE_NAME];
    if (!cookie) {
      throw new ApiError(401, 'Invalid User');
    }
    const userData = getUserFromSession(cookie);
    res.json(userData);
  } catch (err) {
    next(err);
  }
}
