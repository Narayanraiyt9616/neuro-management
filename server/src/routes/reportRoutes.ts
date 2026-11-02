import { Router } from 'express';
import ReportController from '../controllers/reportController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post(
  '/generate',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  ReportController.generateReport
);

router.get(
  '/download',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  ReportController.downloadReportCsv
);

export default router;

