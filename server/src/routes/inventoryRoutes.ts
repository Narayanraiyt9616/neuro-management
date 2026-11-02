import { Router } from 'express';
import InventoryController from '../controllers/inventoryController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router: Router = Router();

// All Inventory routes require authentication
router.use(authenticateToken);

/**
 * ============================================================================
 * MODULE 8: INVENTORY ANALYTICS & MODULE 3: LOW STOCK ALERTS
 * ============================================================================
 */
router.get(
  '/analytics',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  InventoryController.getInventoryAnalytics
);

router.get(
  '/low-stock-alerts',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  InventoryController.getLowStockAlerts
);

/**
 * ============================================================================
 * MODULE 4: CATEGORY MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/categories',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  InventoryController.listCategories
);

router.post(
  '/categories',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  InventoryController.createCategory
);

router.put(
  '/categories/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  InventoryController.updateCategory
);

router.delete(
  '/categories/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  InventoryController.deleteCategory
);

/**
 * ============================================================================
 * MODULE 1: PRODUCT MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/products',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  InventoryController.listProducts
);

router.post(
  '/products',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  InventoryController.createProduct
);

router.get(
  '/products/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  InventoryController.getProductById
);

router.put(
  '/products/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  InventoryController.updateProduct
);

router.delete(
  '/products/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  InventoryController.deleteProduct
);

/**
 * ============================================================================
 * MODULE 7: WAREHOUSE MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/warehouses',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  InventoryController.listWarehouses
);

router.post(
  '/warehouses',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  InventoryController.createWarehouse
);

router.put(
  '/warehouses/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  InventoryController.updateWarehouse
);

router.delete(
  '/warehouses/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  InventoryController.deleteWarehouse
);

/**
 * ============================================================================
 * MODULE 2: STOCK MOVEMENTS & ADJUSTMENTS
 * ============================================================================
 */
router.post(
  ['/stock-movements', '/movements'],
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  InventoryController.recordStockMovement
);

router.get(
  ['/stock-ledger', '/ledger'],
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  InventoryController.getStockHistory
);

/**
 * ============================================================================
 * MODULE 7: STOCK TRANSFERS
 * ============================================================================
 */
router.get(
  ['/stock-transfers', '/transfers'],
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  InventoryController.listStockTransfers
);

router.post(
  ['/stock-transfers', '/transfers'],
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  InventoryController.createStockTransfer
);

export default router;
