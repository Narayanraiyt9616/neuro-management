import { Router } from 'express';
import BillingController from '../controllers/billingController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public / Unauthenticated Webhook endpoint (verified cryptographically)
router.post('/webhook', BillingController.handleWebhook);

// Available plans catalog can be queried by authenticated users
router.get('/plans', authenticateToken, BillingController.getPlans);

// Protected Billing operations
router.get(
  '/current',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  BillingController.getCurrentStatus
);

router.post(
  '/subscribe',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  BillingController.subscribePlan
);

router.post(
  '/change-plan',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  BillingController.changePlan
);

router.post(
  '/renew',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  BillingController.renewSubscription
);

router.post(
  '/cancel',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  BillingController.cancelSubscription
);

router.get(
  '/payments',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  BillingController.getPaymentHistory
);

export default router;

