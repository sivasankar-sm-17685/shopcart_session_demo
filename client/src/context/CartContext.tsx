// External
import { useEffect, useState, type ReactNode } from 'react';

// Types
import type { CartContextValue, CartItem } from '../types/cart';

// Context
import { CartContext } from './cartContextInstance';

// Hooks
import { useAuth } from '../hooks/useAuth';

// Api
import {
  getCart,
  addItem,
  removeItem,
  clearCart,
  updateQuantity
} from '../api/cartApi';

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    let isCancelled = false;

    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const itemData = await getCart();
        if (!isCancelled) {
          setItems(itemData.items);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Unable to fetch cart');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchCart();
    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  const addItemToCart = async (item: Omit<CartItem, 'quantity'>) => {
    setIsUpdatingCart(true);
    try {
      const cartItems = await addItem({
        id: item.id,
        quantity: 1
      });
      setItems(cartItems);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to Add Item to Cart'
      );
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const updateItemInCart = async (
    id: CartItem['id'],
    quantity: CartItem['quantity']
  ) => {
    setIsUpdatingCart(true);
    try {
      const cartItems = await updateQuantity(id, quantity);
      setItems(cartItems);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to Update Cart');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const removeItemFromCart = async (id: CartItem['id']) => {
    setIsUpdatingCart(true);
    try {
      const cartItems = await removeItem(id);
      setItems(cartItems);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to Remove Item to Cart'
      );
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const clearItemsFromCart = async () => {
    setIsUpdatingCart(true);
    try {
      await clearCart();
      setItems([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to Clear Cart');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const value: CartContextValue = {
    items,
    isLoading,
    isUpdatingCart,
    error,
    addItem: addItemToCart,
    removeItem: removeItemFromCart,
    updateQuantity: updateItemInCart,
    clearCart: clearItemsFromCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
