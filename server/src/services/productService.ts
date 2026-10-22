import type { ProductItemResponse, ProductsResponse } from '../types/product';
import { THIRD_PARTY_BASE_URL } from '../config/env';
import { ApiError } from '../utils/ApiError';

export async function getProducts(
  limit?: number,
  skip?: number
): Promise<ProductsResponse> {
  let url = `${THIRD_PARTY_BASE_URL}/products`;
  let separator = '?';
  if (limit && limit > 0) {
    url += `${separator}limit=${limit}`;
    separator = '&';
  }
  if (skip && skip > 0) {
    url += `${separator}skip=${skip}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorBody?.message ?? 'Unable to process your request'
    );
  }
  return response.json();
}

export async function getProductById(id: number): Promise<ProductItemResponse> {
  const response = await fetch(`${THIRD_PARTY_BASE_URL}/products/${id}`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorBody?.message ?? 'Unable to process your request'
    );
  }
  return response.json();
}
