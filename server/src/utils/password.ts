import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string): {
  hash: string;
  salt: string;
} {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  const compareHash = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(compareHash, 'hex')
  );
}
