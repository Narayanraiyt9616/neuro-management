import { Router, Response } from 'express';
import healthRoutes from './healthRoutes';
import contactRoutes from './contactRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import businessRoutes from './businessRoutes';
import hrRoutes from './hrRoutes';
import crmRoutes from './crmRoutes';
import salesRoutes from './salesRoutes';
import inventoryRoutes from './inventoryRoutes';
import purchaseRoutes from './purchaseRoutes';
import financeRoutes from './financeRoutes';
import projectRoutes from './projectRoutes';
import notificationRoutes from './notificationRoutes';
import aiAssistantRoutes from './aiAssistantRoutes';
import analyticsRoutes from './analyticsRoutes';
import reportRoutes from './reportRoutes';
import billingRoutes from './billingRoutes';
import branchRoutes from './branchRoutes';
import posRoutes from './posRoutes';
import customerPortalRoutes from './customerPortalRoutes';
import { authenticateToken, authorizeRoles, authorizeBusiness } from '../middleware/authMiddleware';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';

const router: Router = Router();

// Mount modular API routes
router.use('/health', healthRoutes);
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/business', businessRoutes);
router.use('/hr', hrRoutes);
router.use('/business/:businessId/hr', hrRoutes);

// Part 6: CRM & Sales Management Routes
router.use('/crm', crmRoutes);
router.use('/business/:businessId/crm', crmRoutes);
router.use('/sales', salesRoutes);
router.use('/business/:businessId/sales', salesRoutes);

// Part 7: Inventory, Warehouse, Supplier & Purchase Routes
router.use('/inventory', inventoryRoutes);
router.use('/business/:businessId/inventory', inventoryRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/business/:businessId/purchase', purchaseRoutes);

// Part 8: Finance, Expense, Invoicing & GST Routes
router.use('/finance', financeRoutes);
router.use('/business/:businessId/finance', financeRoutes);

// Part 9: Projects, Tasks, Kanban, Collaboration, Documents & Calendar Routes
router.use('/projects', projectRoutes);
router.use('/business/:businessId/projects', projectRoutes);

// Real-Time Notification Routes
router.use('/notifications', notificationRoutes);
router.use('/business/:businessId/notifications', notificationRoutes);

// Part 10: AI Business Assistant & Insights Routes
router.use('/ai', aiAssistantRoutes);
router.use('/business/:businessId/ai', aiAssistantRoutes);

// Part 10: Advanced Analytics Routes
router.use('/analytics', analyticsRoutes);
router.use('/business/:businessId/analytics', analyticsRoutes);

// Part 10: Business Reports Generator Routes
router.use('/reports', reportRoutes);
router.use('/business/:businessId/reports', reportRoutes);

// Part 10: Subscriptions & Payment Gateway Webhook Routes
router.use('/billing', billingRoutes);
router.use('/business/:businessId/billing', billingRoutes);

// Enterprise Phase 1: Multi-Branch Management Routes
router.use('/branches', branchRoutes);
router.use('/business/:businessId/branches', branchRoutes);

// Enterprise Phase 2: Point of Sale (POS) System Routes
router.use('/pos', posRoutes);
router.use('/business/:businessId/pos', posRoutes);

// Enterprise Phase 3: Advanced Customer Portal Routes
router.use('/portal', customerPortalRoutes);
router.use('/business/:businessId/portal', customerPortalRoutes);


/**
 * Backward compatibility test endpoints from Part 2
 */
router.get(
  '/admin/platform-overview',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN'),
  (req: IAuthRequest, res: Response) => {
    return ApiResponse.success(res, {
      scope: 'PLATFORM_WIDE',
      adminUser: req.user?.email,
      managedBusinessesCount: 'ALL'
    }, 'Super admin authorization verified.');
  }
);

export default router;
