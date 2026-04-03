import { Role } from '@prisma/client';
import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', ctrl.getOverview);
router.get('/category', authorize(Role.ANALYST, Role.ADMIN), ctrl.getCategory);
router.get('/monthly', authorize(Role.ANALYST, Role.ADMIN), ctrl.getMonthly);
router.get('/recent', ctrl.getRecent);

export default router;
