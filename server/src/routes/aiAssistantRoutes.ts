import { Router } from 'express';
import AiAssistantController from '../controllers/aiAssistantController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// AI Queries accessible by Super Admin, Business Owner, and Managers
router.post(
  '/query',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  AiAssistantController.askQuestion
);

router.get(
  '/insights',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  AiAssistantController.getInsights
);

export default router;

