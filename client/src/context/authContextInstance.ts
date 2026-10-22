// External
import { createContext } from 'react';

// Types
import type { AuthContextValue } from '../types/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
