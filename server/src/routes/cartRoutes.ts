import { Router } from 'express';
import {
  addItemToCart,
  clearCartItems,
  getCartItems,
  removeCartItems,
  updateCartItem
} from '../controllers/cartController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', getCartItems);
router.post('/items', addItemToCart);
router.patch('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItems);
router.delete('/', clearCartItems);

export { router as cartRouter };
