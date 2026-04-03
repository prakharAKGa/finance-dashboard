import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { Role } from '../services/mockDb';

const router = Router();

router.use(authenticate);

router.get('/summary',    ctrl.getSummary);
router.get('/categories', authorize(Role.ANALYST, Role.ADMIN), ctrl.getCategories);
router.get('/trends',     authorize(Role.ANALYST, Role.ADMIN), ctrl.getTrends);

export default router;
