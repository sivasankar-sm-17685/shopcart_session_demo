// External
import { useState } from 'react';

// Utils
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem
} from '../utils/browser';

const AUTH_TOKEN_KEY = 'authToken';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    getLocalStorageItem(AUTH_TOKEN_KEY)
  );

  const signIn = (accessToken: string) => {
    setLocalStorageItem(AUTH_TOKEN_KEY, accessToken);
    setToken(accessToken);
  };

  const signOut = () => {
    removeLocalStorageItem(AUTH_TOKEN_KEY);
    setToken(null);
  };

  return { isAuthenticated: token !== null, signIn, signOut };
}
