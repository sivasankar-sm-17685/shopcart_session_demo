// External
import { createContext } from 'react';

// Types
import type { CartContextValue } from '../types/cart';

export const CartContext = createContext<CartContextValue | undefined>(
  undefined
);
