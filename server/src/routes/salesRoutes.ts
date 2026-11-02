import { Router } from 'express';
import SalesController from '../controllers/salesController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router: Router = Router();

// All Sales routes require authentication
router.use(authenticateToken);

/**
 * ============================================================================
 * MODULE 6: SALES ANALYTICS
 * ============================================================================
 */
router.get(
  '/analytics',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  SalesController.getSalesAnalytics
);

/**
 * ============================================================================
 * MODULE 4: SALES MANAGEMENT & ORDERS
 * ============================================================================
 */
router.get(
  '/orders',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE', 'CUSTOMER'),
  SalesController.listSalesOrders
);

router.post(
  '/orders',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  SalesController.createSalesOrder
);

router.get(
  '/orders/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE', 'CUSTOMER'),
  SalesController.getSalesOrderById
);

router.patch(
  '/orders/:id/status',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  SalesController.updateOrderStatus
);

router.post(
  '/orders/:id/cancel',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  SalesController.cancelSalesOrder
);

export default router;

