import type {
  AuthResult,
  PublicUser,
  CurrentUserResponse
} from '../types/auth';
import { THIRD_PARTY_BASE_URL } from '../config/env';
import { ApiError } from '../utils/apiError';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  createUser,
  findUserById,
  findUserByName
} from '../store/userStore';
import {
  createSession,
  deleteSession,
  findSession
} from '../store/sessionStore';

export function signUpUser(username: string, password: string): AuthResult {
  const { hash, salt } = hashPassword(password);
  const user = createUser(username, hash, salt);
  const token = createSession(user.id);

  return { user: { id: user.id, username: user.username }, token };
}

export function loginUser(username: string, password: string): AuthResult {
  const user = findUserByName(username);

  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const token = createSession(user.id);

  return { user: { id: user.id, username: user.username }, token };
}

export function signOutUser(token: string): void {
  deleteSession(token);
}

export function getUserFromSession(token: string): PublicUser {
  const session = findSession(token);
  if (!session) {
    throw new ApiError(401, 'Invalid or expired session');
  }

  const user = findUserById(session.userId);
  if (!user) {
    throw new ApiError(401, 'Invalid or expired session');
  }

  return { id: user.id, username: user.username };
}

// Old DummyJSON token check — still used by requireAuth until the cart step.
export async function getCurrentUser(
  token: string
): Promise<CurrentUserResponse> {
  const response = await fetch(`${THIRD_PARTY_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(401, errorBody?.message ?? 'Invalid or expired token');
  }

  return response.json();
}
