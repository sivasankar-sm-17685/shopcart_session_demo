import { Router } from 'express';
import { me, signin, signout, signup } from '../controllers/authController';

const router = Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/signout', signout);
router.get('/me', me);

export { router as AuthRouter };
