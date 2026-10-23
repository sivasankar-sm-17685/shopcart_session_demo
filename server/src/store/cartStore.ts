import { readFile, writeFile } from 'fs/promises';
import path from 'node:path';

import type { CartItem } from '../types/cart';
import { ApiError } from '../utils/apiError';

type CartData = Record<string, CartItem[]>;

const CART_FILE_PATH = path.join(process.cwd(), 'data', 'cart.json');

async function readCartData(): Promise<CartData> {
  try {
    const raw = await readFile(CART_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      return {};
    }
    throw err;
  }
}

async function writeCartData(data: CartData): Promise<void> {
  await writeFile(CART_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getCart(userId: number): Promise<CartItem[]> {
  const readData = await readCartData();
  return readData[String(userId)] ?? [];
}

export async function addItem(
  userId: number,
  item: CartItem
): Promise<CartItem[]> {
  let dbData = await readCartData();
  const cart = dbData[String(userId)] || [];
  let isItemExists = cart.some((existingData) => existingData.id === item.id);
  if (isItemExists) {
    throw new ApiError(409, 'Item already in cart');
  }
  cart.push(item);
  dbData[String(userId)] = cart;
  await writeCartData(dbData);
  return cart;
}

export async function updateItem(
  userId: number,
  itemId: number,
  quantity: number
): Promise<CartItem[]> {
  let dbData = await readCartData();
  const cart = dbData[String(userId)] || [];
  const index = cart.findIndex((existing) => existing.id === itemId);
  if (index === -1) {
    throw new ApiError(404, 'Item does not exists');
  }
  if (quantity <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = quantity;
  }
  dbData[String(userId)] = cart;
  await writeCartData(dbData);
  return cart;
}

export async function removeItem(
  userId: number,
  itemId: number
): Promise<CartItem[]> {
  let dbData = await readCartData();
  const cart = dbData[String(userId)] || [];
  const index = cart.findIndex((existing) => existing.id === itemId);
  if (index === -1) {
    throw new ApiError(404, 'Item does not exists');
  }
  cart.splice(index, 1);
  dbData[String(userId)] = cart;
  await writeCartData(dbData);
  return cart;
}

export async function clearCart(userId: number) {
  let dbData = await readCartData();
  dbData[String(userId)] = [];
  await writeCartData(dbData);
}
