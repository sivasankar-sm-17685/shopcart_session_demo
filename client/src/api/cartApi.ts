// Types
import type { CartItem, GetCartResponse } from '../types/cart';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  errorMessage: string
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { ...options.headers },
    credentials: 'include'
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? errorMessage);
  }

  return response.json();
}

export function getCart(): Promise<GetCartResponse> {
  return fetchJson<GetCartResponse>(
    `${baseUrl}/cart`,
    {},
    'Unable to fetch cart'
  );
}

export function addItem(item: {
  id: number;
  quantity: number;
}): Promise<CartItem[]> {
  return fetchJson<CartItem[]>(
    `${baseUrl}/cart/items`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    },
    'Unable to add item to cart'
  );
}

export function updateQuantity(
  itemId: number,
  quantity: number
): Promise<CartItem[]> {
  return fetchJson<CartItem[]>(
    `${baseUrl}/cart/items/${itemId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    },
    'Unable to update item quantity'
  );
}

export function removeItem(itemId: number): Promise<CartItem[]> {
  return fetchJson<CartItem[]>(
    `${baseUrl}/cart/items/${itemId}`,
    { method: 'DELETE' },
    'Unable to remove item from cart'
  );
}

export async function clearCart(): Promise<void> {
  const response = await fetch(`${baseUrl}/cart`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Unable to clear cart');
  }
}
