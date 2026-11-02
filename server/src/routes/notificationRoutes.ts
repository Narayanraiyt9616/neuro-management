import { Router } from 'express';
import hrController from '../controllers/hrController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', hrController.getUserNotifications);
router.patch('/:id/read', hrController.markNotificationAsRead);
router.patch('/read-all', hrController.markAllNotificationsAsRead);

export default router;

