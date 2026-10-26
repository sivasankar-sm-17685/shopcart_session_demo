// External
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
import type { AuthCardProps, AuthMode } from '../types/auth';

// Api
import { loginUser, signUpUser } from '../api/authApi';

// Utils
import { validateAuthFormData } from '../utils/validation';

// Hooks
import { useAuth } from './useAuth';

export function useAuthForm(props: AuthCardProps) {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { showToast } = props;
  const [mode, setMode] = useState<AuthMode>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFormData = () => {
    setUsername('');
    setPassword('');
    setError(null);
  };

  const onSetMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetFormData();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { isValid, errorMessage } = validateAuthFormData(
      { username, password },
      mode
    );
    if (isValid) {
      try {
        setIsSubmitting(true);
        if (mode === 'signin') {
          const data = await loginUser(username, password);
          signIn(data);
          showToast('success', `Welcome ${data.username}`);
          navigate('/products');
        } else {
          const data = await signUpUser(username, password);
          signIn(data);
          showToast(
            'success',
            `Hey ${data.username} your account has been created`
          );
          navigate('/products');
        }
        resetFormData();
      } catch (err) {
        showToast(
          'failure',
          err instanceof Error ? err.message : 'Something went wrong'
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError(errorMessage);
    }
  };

  return {
    mode,
    username,
    password,
    isSubmitting,
    error,
    onSetMode,
    onUsernameChange: setUsername,
    onPasswordChange: setPassword,
    onSubmit
  };
}
