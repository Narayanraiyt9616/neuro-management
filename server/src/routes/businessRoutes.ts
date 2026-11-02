import { Router, Response } from 'express';
import { registerBusiness } from '../controllers/businessController';
import businessOwnerController from '../controllers/businessOwnerController';
import { authenticateToken, authorizeRoles, authorizeBusiness } from '../middleware/authMiddleware';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';

const router: Router = Router();

/**
 * Public Business Registration Endpoint
 */
router.post('/register', registerBusiness);

/**
 * Business Switching: Get all businesses accessible by the current authenticated user
 */
router.get(
  '/my-businesses',
  authenticateToken,
  businessOwnerController.getMyBusinesses
);

/**
 * Tenant-Isolated Business Overview
 */
router.get(
  '/:businessId/overview',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  (req: IAuthRequest, res: Response) => {
    return ApiResponse.success(
      res,
      {
        businessId: req.params.businessId,
        ownerEmail: req.user?.email,
        role: req.user?.role
      },
      'Business authorization and tenant isolation verified.'
    );
  }
);

/**
 * Part 4: Business Owner Dashboard Statistics (10 DB Statistics)
 */
router.get(
  '/:businessId/dashboard/stats',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.getDashboardStats
);

/**
 * Part 4: Business Owner Analytics (6 Interactive Charts)
 */
router.get(
  '/:businessId/dashboard/analytics',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.getAnalytics
);

/**
 * Part 4: Business Recent Activities (from MongoDB ActivityLog)
 */
router.get(
  '/:businessId/dashboard/activities',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.getRecentActivities
);

/**
 * Tenant Audit Logs
 */
router.get(
  '/:businessId/audit-logs',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  authorizeBusiness,
  businessOwnerController.getAuditLogs
);

/**
 * Part 4: Update Business Profile
 */
router.put(
  '/:businessId/profile',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.updateBusinessProfile
);

/**
 * Part 4: Update Business Settings
 */
router.put(
  '/:businessId/settings',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.updateBusinessSettings
);

/**
 * Part 4: Quick Actions
 */
router.post(
  '/:businessId/quick-actions/employee',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.quickAddEmployee
);

router.post(
  '/:businessId/quick-actions/customer',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.quickAddCustomer
);

router.post(
  '/:businessId/quick-actions/invoice',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.quickCreateInvoice
);

router.post(
  '/:businessId/quick-actions/product',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.quickAddProduct
);

router.post(
  '/:businessId/quick-actions/purchase-order',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.quickCreatePurchaseOrder
);

router.post(
  '/:businessId/quick-actions/project',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  authorizeBusiness,
  businessOwnerController.quickCreateProject
);

export default router;
