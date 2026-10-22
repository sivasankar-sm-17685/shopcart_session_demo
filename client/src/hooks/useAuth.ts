// External
import { useState } from 'react';

// Utils
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem
} from '../utils/browser';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_ID_KEY = 'authUserId';

export function useAuth() {
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

  return { isAuthenticated: token !== null, token, userId, signIn, signOut };
}
