import type { Request, Response, NextFunction } from 'express';
import { loginUser, signUpUser } from '../services/authService';
import { validateAuthCredentials } from '../utils/validation';

export async function signin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = validateAuthCredentials(req.body);
    const result = await loginUser(username, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = validateAuthCredentials(req.body);
    const result = await signUpUser(username, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
