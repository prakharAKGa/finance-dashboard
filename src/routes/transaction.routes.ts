import { Role } from '@prisma/client';
import { Router } from 'express';
import * as ctrl from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    createTransactionSchema,
    importTransactionSchema,
    listTransactionSchema,
    updateTransactionSchema,
} from '../schemas/transaction.schema';

const router = Router();

router.use(authenticate);

router.get('/export', authorize(Role.ANALYST, Role.ADMIN), ctrl.exportData);
router.post('/import', authorize(Role.ANALYST, Role.ADMIN), validate(importTransactionSchema), ctrl.importData);
router.get(  '/',   validate(listTransactionSchema), ctrl.list);
router.get(  '/:id', ctrl.getOne);
router.post( '/',   authorize(Role.ANALYST, Role.ADMIN), validate(createTransactionSchema), ctrl.create);
router.put('/:id', authorize(Role.ANALYST, Role.ADMIN), validate(updateTransactionSchema), ctrl.update);
router.patch('/:id', authorize(Role.ANALYST, Role.ADMIN), validate(updateTransactionSchema), ctrl.update);
router.delete('/:id', authorize(Role.ADMIN), ctrl.remove);

export default router;
