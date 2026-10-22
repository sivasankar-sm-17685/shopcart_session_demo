import type { LoginResponse, SignUpResponse } from '../types/auth';
import { THIRD_PARTY_BASE_URL } from '../config/env';
import { ApiError } from '../utils/ApiError';

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
