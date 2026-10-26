// External
import { Navigate } from 'react-router-dom';

// Types
import type { AuthCardProps } from '../../types/auth';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import { useAuthForm } from '../../hooks/useAuthForm';

// Components
import PageLoader from '../../components/PageLoader';

// Features
import AuthForm from './AuthForm';

// CSS
import '../../App.css';

function AuthCard(props: AuthCardProps) {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const {
    mode,
    username,
    password,
    isSubmitting,
    error,
    onSetMode,
    onUsernameChange,
    onPasswordChange,
    onSubmit
  } = useAuthForm(props);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to='/products' replace />;
  }

  return (
    <div className='auth-landing'>
      <div className='auth-card'>
        <div className='auth-title'>
          {mode === 'signin' ? 'Welcome home!!!' : 'Create your account'}
        </div>
        <div className='auth-tabs'>
          <button
            type='button'
            className={`tab-button ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => onSetMode('signin')}
          >
            Sign In
          </button>
          <button
            type='button'
            className={`tab-button ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => onSetMode('signup')}
          >
            Sign Up
          </button>
        </div>
        <AuthForm
          username={username}
          password={password}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={onSubmit}
          onUsernameChange={onUsernameChange}
          onPasswordChange={onPasswordChange}
        />
      </div>
    </div>
  );
}

export default AuthCard;
