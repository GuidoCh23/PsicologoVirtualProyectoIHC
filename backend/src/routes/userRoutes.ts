import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Update profile
router.put('/profile', (req, res) => userController.updateProfile(req as any, res));

// Get statistics
router.get('/statistics', (req, res) => userController.getStatistics(req as any, res));

// Delete account
router.delete('/account', (req, res) => userController.deleteAccount(req as any, res));

export default router;
