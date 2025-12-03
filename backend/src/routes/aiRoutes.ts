import { Router } from 'express';
import aiController from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Send message to AI
router.post('/message', (req, res) => aiController.sendMessage(req as any, res));

export default router;
