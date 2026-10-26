import type { Request, Response, NextFunction } from 'express';
import {
  addItem,
  clearCart,
  getCart,
  removeItem,
  updateItem
} from '../store/cartStore';
import { getProductById } from '../services/productService';
import {
  requireUserId,
  validateAddToCartBody,
  validateNumericParam,
  validateUpdateQuantityBody
} from '../utils/validation';

export async function getCartItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireUserId(req.userId);
    const items = await getCart(userId);
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    res.json({ items, total });
  } catch (err) {
    next(err);
  }
}

export async function addItemToCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireUserId(req.userId);
    const { id, quantity } = validateAddToCartBody(req.body);
    const itemData = await getProductById(id);
    const cartItem = {
      id,
      quantity,
      thumbnail: itemData.thumbnail,
      title: itemData.title,
      price: itemData.price
    };
    const data = await addItem(userId, cartItem);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireUserId(req.userId);
    const itemId = validateNumericParam(req.params.id, 'item id');
    const { quantity } = validateUpdateQuantityBody(req.body);
    const data = await updateItem(userId, itemId, quantity);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function removeCartItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireUserId(req.userId);
    const itemId = validateNumericParam(req.params.id, 'item id');
    const data = await removeItem(userId, itemId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function clearCartItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireUserId(req.userId);
    await clearCart(userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
