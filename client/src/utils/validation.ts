// Types
import type { AuthFormData, AuthMode } from '../types/auth';

interface validationResponse {
  isValid: boolean;
  errorMessage: string | null;
}
export function validateAuthFormData(
  data: AuthFormData,
  mode: AuthMode
): validationResponse {
  let isValid: boolean = true,
    errorMessage: string | null = null;
  const { username, password } = data;
  if (username === null || username.trim().length === 0) {
    isValid = false;
    errorMessage = 'Username is required';
  } else if (password === null || password.trim().length === 0) {
    isValid = false;
    errorMessage = 'Password is required';
  } else if (username.trim().length < 3) {
    isValid = false;
    errorMessage = 'User name should have atleast 3 characters';
  } else if (
    mode === 'signup' &&
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]).{8,}$/.test(
      password
    )
  ) {
    isValid = false;
    errorMessage = 'Invalid Password, try a secured passsword';
  }
  return { isValid, errorMessage };
}
