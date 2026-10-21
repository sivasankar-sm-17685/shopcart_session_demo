// External
import { useEffect, useState } from 'react';

// Types
import type { ProductItem } from '../types/products';

// Api
import { getProductById } from '../api/productsApi';

export function useProductDetail(id: number) {
  const [productDetail, setProductDetail] = useState<ProductItem>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const getProductDetail = async (id: ProductItem['id']) => {
      setIsLoading(true);
      try {
        const productDetail = await getProductById(id);
        if (!isCancelled) {
          setProductDetail(productDetail);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to fetch product details'
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    getProductDetail(id);

    return () => {
      isCancelled = true;
    };
  }, [id]);

  return { productDetail, isLoading, error };
}
