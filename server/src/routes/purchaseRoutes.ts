import { Router } from 'express';
import PurchaseController from '../controllers/purchaseController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router: Router = Router();

// All Purchase routes require authentication
router.use(authenticateToken);

/**
 * ============================================================================
 * MODULE 5: SUPPLIER MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/suppliers',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PurchaseController.listSuppliers
);

router.post(
  '/suppliers',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  PurchaseController.createSupplier
);

router.get(
  '/suppliers/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PurchaseController.getSupplierById
);

router.put(
  '/suppliers/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  PurchaseController.updateSupplier
);

router.delete(
  '/suppliers/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  PurchaseController.deleteSupplier
);

/**
 * ============================================================================
 * MODULE 6: PURCHASE ORDER MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/orders',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PurchaseController.listPurchaseOrders
);

router.post(
  '/orders',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  PurchaseController.createPurchaseOrder
);

router.get(
  '/orders/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PurchaseController.getPurchaseOrderById
);

router.patch(
  '/orders/:id/approve',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  PurchaseController.approvePurchaseOrder
);

router.post(
  '/orders/:id/receive',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  PurchaseController.receivePurchaseItems
);

router.post(
  '/orders/:id/cancel',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  PurchaseController.cancelPurchaseOrder
);

export default router;

