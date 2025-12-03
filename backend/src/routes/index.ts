import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import sessionRoutes from './sessionRoutes';
import taskRoutes from './taskRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sessions', sessionRoutes);
router.use('/tasks', taskRoutes);
router.use('/ai', aiRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
