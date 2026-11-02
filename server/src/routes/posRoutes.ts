import { Router } from 'express';
import PosController from '../controllers/posController';
import { authenticateToken, authorizeRoles, authorizeBusiness } from '../middleware/authMiddleware';

const router = Router();

// All POS routes require authentication and tenant isolation
router.use(authenticateToken, authorizeBusiness);

// Catalog Quick Search
router.get(
  '/catalog/search',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PosController.searchCatalog
);

// Session lifecycle
router.post(
  '/sessions/open',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PosController.openSession
);

router.get(
  '/sessions/current',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PosController.getCurrentSession
);

router.post(
  '/sessions/:id/close',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PosController.closeSession
);

router.post(
  '/sessions/:id/adjust-cash',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PosController.adjustCash
);

router.get(
  '/sessions/:id/z-report',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  PosController.getZReport
);

// High-speed Fast Tender Checkout
router.post(
  '/checkout',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PosController.processCheckout
);

// Hold & Resume Carts
router.post(
  '/sessions/:id/hold',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PosController.holdCart
);

router.get(
  '/sessions/:id/held',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PosController.getHeldCarts
);

router.delete(
  '/sessions/:id/held/:holdId',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  PosController.removeHeldCart
);

export default router;

