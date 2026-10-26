import express from 'express';
import cors from 'cors';
import { AuthRouter } from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';
import { ProductRouter } from './routes/productRoutes';
import { cartRouter } from './routes/cartRoutes';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', AuthRouter);

app.use('/api/products', ProductRouter);

app.use('/api/cart', cartRouter);

app.use(errorHandler);

export { app };
