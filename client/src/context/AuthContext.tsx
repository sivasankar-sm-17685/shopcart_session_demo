// External
import { useEffect, useState, type ReactNode } from 'react';

// Types
import type { AuthContextValue, GetMeResponse } from '../types/auth';

// Api
import { getMe, signout } from '../api/authApi';

// Context
import { AuthContext } from './authContextInstance';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GetMeResponse | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const checkSession = async () => {
      try {
        const currentUser = await getMe();
        if (!isCancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!isCancelled) {
          setUser(null);
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  const signIn = (nextUser: GetMeResponse) => {
    setUser(nextUser);
  };

  const signOut = async () => {
    await signout();
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isCheckingAuth,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
