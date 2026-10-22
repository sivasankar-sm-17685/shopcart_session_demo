// Types
import type { LoginResponse, SignUpResponse } from '../types/auth';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${baseUrl}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Invalid Credentials');
  }

  return response.json();
}

export async function signUpUser(
  username: string,
  password: string
): Promise<SignUpResponse> {
  const response = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Unable to create account');
  }

  return response.json();
}
