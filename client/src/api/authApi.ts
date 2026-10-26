// Types
import type {
  GetMeResponse,
  LoginResponse,
  SignUpResponse
} from '../types/auth';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${baseUrl}/auth/signin`, {
    method: 'POST',
    credentials: 'include',
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
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Unable to create account');
  }

  return response.json();
}

export async function getMe(): Promise<GetMeResponse | null> {
  const response = await fetch(`${baseUrl}/auth/me`, {
    method: 'GET',
    credentials: 'include'
  });

  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Unable to get auth details');
  }
  return response.json();
}

export async function signout(): Promise<void> {
  const response = await fetch(`${baseUrl}/auth/signout`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Unable to sign out');
  }
}
