import type {
  LoginResponse,
  SignUpResponse,
  CurrentUserResponse
} from '../types/auth';
import { THIRD_PARTY_BASE_URL } from '../config/env';
import { ApiError } from '../utils/apiError';

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${THIRD_PARTY_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorBody?.message ?? 'Unable to process your request'
    );
  }

  return response.json();
}

export async function signUpUser(
  username: string,
  password: string
): Promise<SignUpResponse> {
  const response = await fetch(`${THIRD_PARTY_BASE_URL}/users/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorBody?.message ?? 'Unable to process your request'
    );
  }

  return response.json();
}

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
