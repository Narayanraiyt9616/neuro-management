import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController';

const router: Router = Router();

/**
 * @route   GET /api/health
 * @desc    Get API system status and database health
 * @access  Public
 */
router.get('/', getHealthStatus);

export default router;

