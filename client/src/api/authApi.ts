// Types
import type { LoginResponse, SignUpResponse } from '../types/auth';

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error('Invalid Credentials');
  }

  return response.json();
}

export async function signUpUser(
  username: string,
  password: string
): Promise<SignUpResponse> {
  const response = await fetch('https://dummyjson.com/users/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error('Unable to create account');
  }

  return response.json();
}
