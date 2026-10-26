// Types
import type { ToastItem } from './toast';

export type AuthMode = 'signin' | 'signup';

export interface AuthContextValue {
  user: GetMeResponse | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  signIn: (user: GetMeResponse) => void;
  signOut: () => Promise<void>;
}

export interface AuthFormData {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
}

export type SignUpResponse = LoginResponse;
export type GetMeResponse = LoginResponse;

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

export interface ProtectedRouteProps {
  showToast: AuthCardProps['showToast'];
}
