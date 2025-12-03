import { Router } from 'express';
import taskController from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create task
router.post('/', (req, res) => taskController.createTask(req as any, res));

// Get all tasks (with optional status filter)
router.get('/', (req, res) => taskController.getTasks(req as any, res));

// Get pending tasks count
router.get('/pending/count', (req, res) => taskController.getPendingCount(req as any, res));

// Get task by ID
router.get('/:id', (req, res) => taskController.getTaskById(req as any, res));

// Complete task
router.patch('/:id/complete', (req, res) => taskController.completeTask(req as any, res));

// Delete task
router.delete('/:id', (req, res) => taskController.deleteTask(req as any, res));

export default router;
