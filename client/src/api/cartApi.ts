// Types
import type { CartItem, GetCartResponse } from '../types/cart';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

async function fetchJson<T>(
  url: string,
  token: string,
  options: RequestInit = {},
  errorMessage: string
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? errorMessage);
  }

  return response.json();
}

export function getCart(
  userId: string,
  token: string
): Promise<GetCartResponse> {
  return fetchJson<GetCartResponse>(
    `${baseUrl}/cart/${userId}`,
    token,
    {},
    'Unable to fetch cart'
  );
}

export function addItem(
  userId: string,
  token: string,
  item: { id: number; quantity: number }
): Promise<CartItem[]> {
  return fetchJson<CartItem[]>(
    `${baseUrl}/cart/${userId}/items`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    },
    'Unable to add item to cart'
  );
}

export function updateQuantity(
  userId: string,
  token: string,
  itemId: number,
  quantity: number
): Promise<CartItem[]> {
  return fetchJson<CartItem[]>(
    `${baseUrl}/cart/${userId}/items/${itemId}`,
    token,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    },
    'Unable to update item quantity'
  );
}

export function removeItem(
  userId: string,
  token: string,
  itemId: number
): Promise<CartItem[]> {
  return fetchJson<CartItem[]>(
    `${baseUrl}/cart/${userId}/items/${itemId}`,
    token,
    { method: 'DELETE' },
    'Unable to remove item from cart'
  );
}

export async function clearCart(userId: string, token: string): Promise<void> {
  const response = await fetch(`${baseUrl}/cart/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Unable to clear cart');
  }
}
