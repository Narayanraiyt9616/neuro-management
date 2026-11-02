import { Router } from 'express';
import FinanceController from '../controllers/financeController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router: Router = Router();

// All finance routes require authentication
router.use(authenticateToken);

/**
 * ============================================================================
 * MODULE 1: FINANCE DASHBOARD STATS
 * ============================================================================
 */
router.get(
  '/stats',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  FinanceController.getDashboardStats
);

/**
 * ============================================================================
 * MODULE 2: INCOME MANAGEMENT
 * ============================================================================
 */
router.get(
  '/income',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  FinanceController.listIncomes
);

router.post(
  '/income',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.createIncome
);

router.get(
  '/income/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  FinanceController.getIncomeById
);

router.put(
  '/income/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.updateIncome
);

/**
 * ============================================================================
 * MODULE 3: EXPENSE MANAGEMENT & CATEGORIES
 * ============================================================================
 */
router.get(
  '/expense-categories',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  FinanceController.listExpenseCategories
);

router.post(
  '/expense-categories',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.createExpenseCategory
);

router.get(
  '/expenses',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  FinanceController.listExpenses
);

router.post(
  '/expenses',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  FinanceController.createExpense
);

router.patch(
  '/expenses/:id/approve',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.approveExpense
);

router.patch(
  '/expenses/:id/reject',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.rejectExpense
);

router.delete(
  '/expenses/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  FinanceController.deleteExpense
);

/**
 * ============================================================================
 * MODULE 4 & 5: INVOICE MANAGEMENT & GST
 * ============================================================================
 */
router.get(
  '/invoices',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE', 'CUSTOMER'),
  FinanceController.listInvoices
);

router.post(
  '/invoices',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.createInvoice
);

router.post(
  '/invoices/convert-sales-order',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.convertSalesOrderToInvoice
);

router.get(
  '/invoices/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE', 'CUSTOMER'),
  FinanceController.getInvoiceById
);

router.put(
  '/invoices/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.updateInvoice
);

/**
 * ============================================================================
 * MODULE 6: PAYMENT MANAGEMENT & RECONCILIATION
 * ============================================================================
 */
router.get(
  '/payments',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE', 'CUSTOMER'),
  FinanceController.listPayments
);

router.post(
  '/payments',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'CUSTOMER'),
  FinanceController.recordPayment
);

router.post(
  '/refunds',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  FinanceController.recordRefund
);

/**
 * ============================================================================
 * MODULE 7 & 8: FINANCIAL REPORTS & AUDIT TRANSACTIONS
 * ============================================================================
 */
router.get(
  '/reports/profit-loss',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.getProfitLossReport
);

router.get(
  '/reports/gst',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  FinanceController.getGstReport
);

router.get(
  '/transactions',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  FinanceController.listTransactions
);

export default router;

