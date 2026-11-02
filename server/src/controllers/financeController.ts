import { Response, NextFunction } from 'express';
import FinanceService from '../services/financeService';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';
import {
  incomeSchema,
  incomeUpdateSchema,
  expenseCategorySchema,
  expenseSchema,
  expenseUpdateSchema,
  invoiceCreateSchema,
  invoiceUpdateSchema,
  paymentCreateSchema,
  refundCreateSchema
} from '../validators/financeValidator';

function extractBusinessId(req: IAuthRequest): string {
  const headerId = req.headers['x-business-id'] as string;
  const paramId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
  const queryId = req.query.businessId as string;
  const userBizId = req.user?.businessId;
  const bizId = headerId || paramId || queryId || userBizId;
  if (!bizId) {
    throw new Error('Business identifier is required. Provide x-business-id header.');
  }
  return Array.isArray(bizId) ? bizId[0] : bizId;
}

function getParamId(req: IAuthRequest): string {
  const id = req.params.id;
  if (!id) throw new Error('Resource identifier is required in request parameters.');
  return Array.isArray(id) ? id[0] : id;
}

export class FinanceController {
  /**
   * Module 1: Dashboard Stats
   */
  static async getDashboardStats(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const stats = await FinanceService.getDashboardStats(businessId);
      return ApiResponse.success(res, stats, 'Finance statistics retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Module 2: Income Handlers
   */
  static async listIncomes(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      };
      const result = await FinanceService.listIncomes(businessId, filters);
      return ApiResponse.success(res, result, 'Incomes retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async createIncome(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = incomeSchema.parse(req.body);
      const income = await FinanceService.createIncome(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, income, 'Income recorded successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getIncomeById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const income = await FinanceService.getIncomeById(businessId, getParamId(req));
      return ApiResponse.success(res, income, 'Income details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async updateIncome(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = incomeUpdateSchema.parse(req.body);
      const income = await FinanceService.updateIncome(businessId, getParamId(req), validated);
      return ApiResponse.success(res, income, 'Income updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Module 3: Expense Handlers
   */
  static async listExpenseCategories(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const categories = await FinanceService.listExpenseCategories(businessId);
      return ApiResponse.success(res, categories, 'Expense categories retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async createExpenseCategory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = expenseCategorySchema.parse(req.body);
      const category = await FinanceService.createExpenseCategory(businessId, validated);
      return ApiResponse.created(res, category, 'Expense category created successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async listExpenses(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        approvalStatus: req.query.approvalStatus as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      };
      const result = await FinanceService.listExpenses(businessId, filters);
      return ApiResponse.success(res, result, 'Expenses retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async createExpense(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = expenseSchema.parse(req.body);
      const expense = await FinanceService.createExpense(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, expense, 'Expense recorded successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async approveExpense(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const expense = await FinanceService.approveExpense(businessId, getParamId(req), req.user?.userId);
      return ApiResponse.success(res, expense, 'Expense approved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async rejectExpense(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const { reason } = req.body;
      const expense = await FinanceService.rejectExpense(businessId, getParamId(req), reason);
      return ApiResponse.success(res, expense, 'Expense rejected.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteExpense(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const result = await FinanceService.deleteExpense(businessId, getParamId(req));
      return ApiResponse.success(res, result, result.message);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to remove expense.', 400);
    }
  }

  /**
   * Module 4 & 5: Invoice Handlers
   */
  static async listInvoices(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        customerId: req.query.customerId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      };
      const result = await FinanceService.listInvoices(businessId, filters);
      return ApiResponse.success(res, result, 'Invoices retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async createInvoice(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = invoiceCreateSchema.parse(req.body);
      const invoice = await FinanceService.createInvoice(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, invoice, 'Invoice generated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async convertSalesOrderToInvoice(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const { salesOrderId } = req.body;
      if (!salesOrderId) throw new Error('Sales order ID is required.');
      const invoice = await FinanceService.convertSalesOrderToInvoice(businessId, salesOrderId, req.user?.userId);
      return ApiResponse.created(res, invoice, 'Invoice created from sales order successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getInvoiceById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const invoice = await FinanceService.getInvoiceById(businessId, getParamId(req));
      return ApiResponse.success(res, invoice, 'Invoice details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async updateInvoice(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = invoiceUpdateSchema.parse(req.body);
      const invoice = await FinanceService.updateInvoice(businessId, getParamId(req), validated);
      return ApiResponse.success(res, invoice, 'Invoice updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Module 6: Payment Handlers
   */
  static async listPayments(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        search: req.query.search as string,
        invoiceId: req.query.invoiceId as string,
        customerId: req.query.customerId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      };
      const result = await FinanceService.listPayments(businessId, filters);
      return ApiResponse.success(res, result, 'Payments retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async recordPayment(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = paymentCreateSchema.parse(req.body);
      const payment = await FinanceService.recordPayment(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, payment, 'Payment confirmed and reconciled successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation failed', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to record payment.', 400);
    }
  }

  static async recordRefund(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = refundCreateSchema.parse(req.body);
      const refund = await FinanceService.recordRefund(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, refund, 'Refund recorded and processed.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation failed', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to record refund.', 400);
    }
  }

  /**
   * Module 7 & 8: Reports & Transactions
   */
  static async getProfitLossReport(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };
      const report = await FinanceService.getProfitLossReport(businessId, filters);
      return ApiResponse.success(res, report, 'Profit and Loss report generated.');
    } catch (err) {
      next(err);
    }
  }

  static async getGstReport(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };
      const report = await FinanceService.getGstReport(businessId, filters);
      return ApiResponse.success(res, report, 'GST compliance report generated.');
    } catch (err) {
      next(err);
    }
  }

  static async listTransactions(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        search: req.query.search as string,
        type: req.query.type as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      };
      const result = await FinanceService.listTransactions(businessId, filters);
      return ApiResponse.success(res, result, 'Financial transaction ledger retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export default FinanceController;
