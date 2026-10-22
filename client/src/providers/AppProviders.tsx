// External
import type { ReactNode } from 'react';

// Context
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
