// External
import { useContext } from 'react';

// Context
import { AuthContext } from '../context/authContextInstance';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
