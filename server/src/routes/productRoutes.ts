import { Router } from 'express';
import {
  getProductsWithPagination,
  getSpecificProduct
} from '../controllers/productController';

const router = Router();

router.get('/', getProductsWithPagination);
router.get('/:id', getSpecificProduct);

export { router as ProductRouter };
