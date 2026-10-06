import { Router } from 'express';
import { getUsageStats } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authenticate, requireRole('ADMIN'), getUsageStats);

export default router;
