import type { Request, Response, NextFunction } from 'express';
import {
  addItem,
  clearCart,
  getCart,
  removeItem,
  updateItem
} from '../store/cartStore';
import { getProductById } from '../services/productService';

export async function getCartItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId;
    const items = await getCart(Number(userId));
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
    const userId = req.params.userId;
    const { id, quantity } = req.body;
    const itemData = await getProductById(id);
    const cartItem = {
      id,
      quantity,
      thumbnail: itemData.thumbnail,
      title: itemData.title,
      price: itemData.price
    };
    const data = await addItem(Number(userId), cartItem);
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
    const { userId, id } = req.params;
    const { quantity } = req.body;
    const data = await updateItem(Number(userId), Number(id), quantity);
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
    const { userId, id } = req.params;
    const data = await removeItem(Number(userId), Number(id));
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
    const { userId } = req.params;
    const data = await clearCart(Number(userId));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
