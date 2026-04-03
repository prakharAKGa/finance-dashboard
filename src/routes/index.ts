import { Router } from 'express';
import authRoutes from './auth.routes';
import transactionRoutes from './transaction.routes';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth',         authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard',    dashboardRoutes);
router.use('/users',        userRoutes);

export default router;
