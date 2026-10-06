import { Router } from 'express';
import { register, login, refresh, logout, getMe, demoLogin } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authLimiter, validateRequest({ body: registerSchema }), register);
router.post('/login', authLimiter, validateRequest({ body: loginSchema }), login);
router.post('/demo', demoLogin);
router.post('/refresh', validateRequest({ body: refreshTokenSchema }), refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
