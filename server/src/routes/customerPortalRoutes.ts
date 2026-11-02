import { Router } from 'express';
import CustomerPortalController from '../controllers/customerPortalController';
import { authenticateToken, authorizeRoles, authorizeBusiness } from '../middleware/authMiddleware';

const router = Router();

// All customer portal routes require authentication and tenant isolation
router.use(authenticateToken, authorizeBusiness);

// Dashboard Stats & Telemetry
router.get(
  '/stats',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CustomerPortalController.getDashboardStats
);

// Order History & Tracking
router.get(
  '/orders',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CustomerPortalController.getOrders
);

// Invoices & Statements
router.get(
  '/invoices',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CustomerPortalController.getInvoices
);

// Instant Online Invoice Payment Simulation
router.post(
  '/invoices/:id/pay',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CustomerPortalController.payInvoice
);

// Quote Approval / Decline Workflow
router.post(
  '/quotes/:id/decision',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CustomerPortalController.decideQuote
);

// Support Ticket System
router.get(
  '/tickets',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CustomerPortalController.listTickets
);

router.get(
  '/tickets/:id',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CustomerPortalController.getTicketById
);

router.post(
  '/tickets',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CustomerPortalController.createTicket
);

router.post(
  '/tickets/:id/reply',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CustomerPortalController.replyTicket
);

// Customer Profile
router.put(
  '/profile',
  authorizeRoles('CUSTOMER', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CustomerPortalController.updateProfile
);

export default router;

