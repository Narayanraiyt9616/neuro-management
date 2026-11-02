import { Router } from 'express';
import BranchController from '../controllers/branchController';
import { authenticateToken, authorizeRoles, authorizeBusiness } from '../middleware/authMiddleware';

const router = Router();

// All branch routes require valid JWT and tenant isolation
router.use(authenticateToken, authorizeBusiness);

// Listing & details
router.get('/', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'), BranchController.getBranches);
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'), BranchController.getBranchById);
router.get('/:id/analytics', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'), BranchController.getBranchAnalytics);

// CRUD
router.post('/', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'), BranchController.createBranch);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'), BranchController.updateBranch);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'), BranchController.deleteBranch);

// Inter-Branch Inventory Transfer
router.post('/transfer-stock', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'), BranchController.transferStock);

export default router;

