// External
import { useContext } from 'react';

// Context
import { CartContext } from './cartContextInstance';

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
