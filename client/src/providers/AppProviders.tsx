// External
import type { ReactNode } from 'react';

// Context
import { CartProvider } from '../context/CartContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
