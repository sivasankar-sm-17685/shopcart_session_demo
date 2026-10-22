// Types
import type { ProductItem, ProductsResponse } from '../types/products';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? errorMessage);
  }

  return response.json();
}

export function getProducts(): Promise<ProductsResponse> {
  return fetchJson<ProductsResponse>(
    `${baseUrl}/products`,
    'Unable to fetch products'
  );
}

export function getProductById(id: ProductItem['id']): Promise<ProductItem> {
  return fetchJson<ProductItem>(
    `${baseUrl}/products/${id}`,
    'Unable to fetch Product Details'
  );
}
