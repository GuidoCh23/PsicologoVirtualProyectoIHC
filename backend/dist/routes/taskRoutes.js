import express from 'express';
import { getTasks, updateTaskStatus } from '../controllers/taskController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
const router = express.Router();
router.use(authenticateToken);
router.get('/', getTasks);
router.patch('/:id', updateTaskStatus);
export default router;
//# sourceMappingURL=taskRoutes.js.map