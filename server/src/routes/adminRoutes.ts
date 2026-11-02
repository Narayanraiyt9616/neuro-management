import { Router } from 'express';
import {
  getOverviewStats,
  getBusinesses,
  getBusinessById,
  approveBusiness,
  rejectBusiness,
  suspendBusiness,
  reactivateBusiness,
  editBusiness,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  getSubscriptions,
  createPaymentGatewayIntent,
  getUsers,
  updateUserStatus,
  getAuditLogs,
  getPlatformSettings,
  updatePlatformSettings
} from '../controllers/adminController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router: Router = Router();

// Platform Admin Routes - Strictly Protected for SUPER_ADMIN only
router.use(authenticateToken, authorizeRoles('SUPER_ADMIN'));

/**
 * Overview & Database Statistics
 */
router.get('/stats', getOverviewStats);

/**
 * Business Management
 */
router.get('/businesses', getBusinesses);
router.get('/businesses/:id', getBusinessById);
router.patch('/businesses/:id/approve', approveBusiness);
router.patch('/businesses/:id/reject', rejectBusiness);
router.patch('/businesses/:id/suspend', suspendBusiness);
router.patch('/businesses/:id/reactivate', reactivateBusiness);
router.put('/businesses/:id', editBusiness);

/**
 * Subscription Plans & Subscriptions
 */
router.get('/plans', getSubscriptionPlans);
router.post('/plans', createSubscriptionPlan);
router.put('/plans/:id', updateSubscriptionPlan);
router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions/payment-gateway-intent', createPaymentGatewayIntent);

/**
 * Platform User Management
 */
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

/**
 * Audit Logs
 */
router.get('/audit-logs', getAuditLogs);

/**
 * Platform Administration Settings
 */
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

export default router;

