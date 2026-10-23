import { db } from '../config/db';
import type { User } from '../types/auth';
import { ApiError } from '../utils/apiError';

export function createUser(
  userName: string,
  passwordHash: string,
  passwordSalt: string
): User {
  try {
    const data = db
      .prepare(
        'INSERT INTO users(username,password_hash,password_salt) VALUES(?,?,?)'
      )
      .run(userName, passwordHash, passwordSalt);

    return {
      username: userName,
      passwordHash,
      passwordSalt,
      id: Number(data.lastInsertRowid)
    };
  } catch (err) {
    if (
      err instanceof Error &&
      'code' in err &&
      err.code === 'SQLITE_CONSTRAINT_UNIQUE'
    ) {
      throw new ApiError(409, 'Username already exists');
    }
    throw err;
  }
}

export function findUserByName(userName: string): User | undefined {
  return db
    .prepare(
      'SELECT id, username, password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE username=?'
    )
    .get(userName) as User | undefined;
}

export function findUserById(id: number): User | undefined {
  return db
    .prepare(
      'SELECT id, username, password_hash AS passwordHash, password_salt AS passwordSalt FROM users where id=?'
    )
    .get(id) as User | undefined;
}
