import { randomBytes } from 'node:crypto';
import { db } from '../config/db';
import { ApiError } from '../utils/apiError';

export function createSession(id: number) {
  const token = randomBytes(32).toString('base64url'),
    expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  try {
    db.prepare(
      'INSERT INTO sessions(user_id, token, expires_at) VALUES (?, ?, ?)'
    ).run(id, token, expiresAt);
    return token;
  } catch (err) {
    if (
      err instanceof Error &&
      'code' in err &&
      err.code === 'SQLITE_CONSTRAINT_UNIQUE'
    ) {
      throw new ApiError(409, 'Session already exists');
    }
    throw err;
  }
}

export function findSession(token: string): { userId: number } | undefined {
  const sessionData = db
    .prepare(
      'SELECT user_id AS userId, expires_at AS expiresAt FROM sessions WHERE token=?'
    )
    .get(token) as { userId: number; expiresAt: number } | undefined;
  if (!sessionData || sessionData.expiresAt < Date.now()) {
    return undefined;
  }
  return { userId: sessionData.userId };
}

export function deleteSession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token=?').run(token);
}
