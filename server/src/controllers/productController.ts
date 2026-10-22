import type { Request, Response, NextFunction } from 'express';
import { getProductById, getProducts } from '../services/productService';

export async function getProductsWithPagination(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { limit = 0, skip = 0 } = req.query;
    const response = await getProducts(Number(limit), Number(skip));
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export const getSpecificProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const response = await getProductById(Number(id));
    res.json(response);
  } catch (err) {
    next(err);
  }
};
