import { Router } from 'express';
import CRMController from '../controllers/crmController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router: Router = Router();

// All CRM routes require authentication
router.use(authenticateToken);

/**
 * ============================================================================
 * MODULE 1: CUSTOMER MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/customers',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.listCustomers
);

router.get(
  '/customers/export',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CRMController.exportCustomers
);

router.post(
  '/customers/import',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CRMController.importCustomers
);

router.post(
  '/customers',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CRMController.createCustomer
);

router.get(
  '/customers/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.getCustomerById
);

router.put(
  '/customers/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CRMController.updateCustomer
);

router.delete(
  '/customers/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  CRMController.deleteCustomer
);

router.get(
  '/customers/:id/timeline',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.getCustomerTimeline
);

/**
 * ============================================================================
 * MODULE 2: CRM LEADS & KANBAN PIPELINE ROUTES
 * ============================================================================
 */
router.get(
  '/leads',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.listLeads
);

router.post(
  '/leads',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.createLead
);

router.put(
  '/leads/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.updateLead
);

router.patch(
  '/leads/:id/status',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.updateLeadStatus
);

router.post(
  '/leads/:id/convert',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CRMController.convertLead
);

router.delete(
  '/leads/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CRMController.deleteLead
);

/**
 * ============================================================================
 * MODULE 3: FOLLOW-UP MANAGEMENT & CALENDAR
 * ============================================================================
 */
router.get(
  '/follow-ups',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.listFollowUps
);

router.post(
  '/follow-ups',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.createFollowUp
);

router.put(
  '/follow-ups/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.updateFollowUp
);

router.delete(
  '/follow-ups/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  CRMController.deleteFollowUp
);

/**
 * ============================================================================
 * MODULE 7: CUSTOMER COMMUNICATION & LOGGING
 * ============================================================================
 */
router.post(
  '/communications',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.recordCommunication
);

router.get(
  '/communications',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  CRMController.getCommunicationHistory
);

export default router;

