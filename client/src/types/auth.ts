// Types
import type { ToastItem } from './toast';

export type AuthMode = 'signin' | 'signup';

export interface AuthFormData {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  username: string;
  accessToken: string;
}

export interface SignUpResponse {
  id: number;
  username: string;
}

export interface AuthFormProps {
  username: string;
  password: string;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onUsernameChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  isSubmitting: boolean;
}

export interface AuthCardProps {
  showToast: (
    status: ToastItem['status'],
    message: ToastItem['message']
  ) => void;
}
