import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import summaryRoutes from './summary.routes';
import transactionRoutes from './transaction.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth',         authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard',    dashboardRoutes);
router.use('/summary',      summaryRoutes);
router.use('/users',        userRoutes);

export default router;
