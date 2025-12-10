import express from 'express';
import { chat } from '../controllers/aiController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
const router = express.Router();
router.use(authenticateToken);
router.post('/chat', chat);
export default router;
//# sourceMappingURL=aiRoutes.js.map