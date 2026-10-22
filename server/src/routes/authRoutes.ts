import { Router } from 'express';
import { signin, signup } from '../controllers/authController';

const router = Router();

router.post('/signin', signin);
router.post('/signup', signup);

export { router as AuthRouter };
