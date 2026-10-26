// External
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

// Types
import type { ProtectedRouteProps } from '../types/auth';

// Hooks
import { useAuth } from '../hooks/useAuth';

// Components
import NavBar from './NavBar';
import PageLoader from './PageLoader';

function ProtectedRoute({ showToast }: ProtectedRouteProps) {
  const { isAuthenticated, isCheckingAuth, signOut } = useAuth();
  const navigate = useNavigate();

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      showToast(
        'failure',
        err instanceof Error ? err.message : 'Unable to sign out'
      );
    }
  };

  return (
    <>
      <NavBar onSignOut={handleSignOut} />
      <Outlet />
    </>
  );
}

export default ProtectedRoute;
