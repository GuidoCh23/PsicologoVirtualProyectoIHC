import { Router } from 'express';
import sessionController from '../controllers/sessionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create session
router.post('/', (req, res) => sessionController.createSession(req as any, res));

// Get all sessions
router.get('/', (req, res) => sessionController.getSessions(req as any, res));

// Get session statistics
router.get('/stats', (req, res) => sessionController.getSessionStats(req as any, res));

// Get session by ID
router.get('/:id', (req, res) => sessionController.getSessionById(req as any, res));

// Delete session
router.delete('/:id', (req, res) => sessionController.deleteSession(req as any, res));

export default router;
