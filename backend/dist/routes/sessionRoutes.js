import express from 'express';
import { createSession, getSessions, deleteSession } from '../controllers/sessionController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
const router = express.Router();
router.use(authenticateToken); // Protect all routes
router.post('/', createSession);
router.get('/', getSessions);
router.delete('/:id', deleteSession);
export default router;
//# sourceMappingURL=sessionRoutes.js.map