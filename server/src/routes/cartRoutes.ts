import { Router } from 'express';
import {
  addItemToCart,
  clearCartItems,
  getCartItems,
  removeCartItems,
  updateCartItem
} from '../controllers/cartController';

const router = Router({ mergeParams: true });

router.get('/', getCartItems);
router.post('/items', addItemToCart);
router.patch('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItems);
router.delete('/', clearCartItems);

export { router as cartRouter };
