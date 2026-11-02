import { Router } from 'express';
import AnalyticsController from '../controllers/analyticsController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  AnalyticsController.getAdvancedAnalytics
);

router.get(
  '/export',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  AnalyticsController.exportAnalyticsCsv
);

export default router;

