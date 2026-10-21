// Types
import type { ProductItem, ProductsResponse } from '../types/products';

async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export function getProducts(): Promise<ProductsResponse> {
  return fetchJson<ProductsResponse>(
    'https://dummyjson.com/products',
    'Unable to fetch products'
  );
}

export function getProductById(id: ProductItem['id']): Promise<ProductItem> {
  return fetchJson<ProductItem>(
    `https://dummyjson.com/products/${id}`,
    'Unable to fetch Product Details'
  );
}
