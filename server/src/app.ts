import express from 'express';
import cors from 'cors';
import { AuthRouter } from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';
import { ProductRouter } from './routes/productRoutes';
import { cartRouter } from './routes/cartRoutes';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api/auth', AuthRouter);

app.use('/api/products', ProductRouter);

app.use('/api/cart/:userId', cartRouter);

app.use(errorHandler);

export { app };
