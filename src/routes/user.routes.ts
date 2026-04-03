import { Router } from 'express';
import * as ctrl from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { Role } from '../services/mockDb';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get(   '/',    ctrl.listAll);
router.patch( '/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
