import type { CookieOptions } from 'express';

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  path: '/'
};
