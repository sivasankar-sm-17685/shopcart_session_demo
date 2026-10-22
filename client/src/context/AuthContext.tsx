// External
import { useState, type ReactNode } from 'react';

// Types
import type { AuthContextValue } from '../types/auth';

// Utils
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem
} from '../utils/browser';

// Context
import { AuthContext } from './authContextInstance';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_ID_KEY = 'authUserId';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    getLocalStorageItem(AUTH_TOKEN_KEY)
  );
  const [userId, setUserId] = useState<string | null>(() =>
    getLocalStorageItem(AUTH_USER_ID_KEY)
  );

  const signIn = (accessToken: string, newUserId: string) => {
    setLocalStorageItem(AUTH_TOKEN_KEY, accessToken);
    setLocalStorageItem(AUTH_USER_ID_KEY, newUserId);
    setToken(accessToken);
    setUserId(newUserId);
  };

  const signOut = () => {
    removeLocalStorageItem(AUTH_TOKEN_KEY);
    removeLocalStorageItem(AUTH_USER_ID_KEY);
    setToken(null);
    setUserId(null);
  };

  const value: AuthContextValue = {
    isAuthenticated: token !== null,
    token,
    userId,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
