import { Router } from 'express';
import authRoutes from './auth.routes';
import conversationRoutes from './conversation.routes';
import chatRoutes from './chat.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import askRoutes from './ask.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use('/auth', authRoutes);
router.use('/conversations', conversationRoutes);
router.use('/chat', chatRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/ask', askRoutes);

export default router;
