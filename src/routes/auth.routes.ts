import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { loginSchema, registerSchema, refreshSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login',    authRateLimiter, validate(loginSchema),    authController.login);
router.post('/refresh',  validate(refreshSchema), authController.refresh);
router.post('/logout',   authenticate, authController.logout);
router.get('/me',        authenticate, authController.me);

export default router;
