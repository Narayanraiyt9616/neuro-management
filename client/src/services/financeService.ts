import apiClient from './api';
import {
  IApiResponse,
  IIncomeItem,
  IExpenseCategoryItem,
  IExpenseItem,
  IInvoiceItemRecord,
  IPaymentRecord,
  IFinancialTransactionRecord,
  IFinanceDashboardStatsData,
  IProfitLossReportData,
  IGstReportData
} from '../types';

export const financeService = {
  /**
   * ============================================================================
   * MODULE 1: FINANCE DASHBOARD
   * ============================================================================
   */
  async getDashboardStats(businessId: string): Promise<IFinanceDashboardStatsData> {
    const res = (await apiClient.get('/finance/stats', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IFinanceDashboardStatsData>;
    return (
      res.data || {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMarginPercent: 0,
        pendingPaymentsAmount: 0,
        receivedPaymentsAmount: 0,
        outstandingInvoicesAmount: 0,
        overdueInvoicesCount: 0,
        paidInvoicesCount: 0,
        totalInvoicesCount: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyRevenueSeries: []
      }
    );
  },

  /**
   * ============================================================================
   * MODULE 2: INCOME MANAGEMENT
   * ============================================================================
   */
  async listIncomes(
    businessId: string,
    filters: { search?: string; category?: string; status?: string; page?: number; limit?: number } = {}
  ): Promise<{ incomes: IIncomeItem[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/finance/income', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ incomes: IIncomeItem[]; total: number; page: number; totalPages: number }>;
    return res.data || { incomes: [], total: 0, page: 1, totalPages: 1 };
  },

  async createIncome(businessId: string, data: any): Promise<IIncomeItem> {
    const res = (await apiClient.post('/finance/income', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IIncomeItem>;
    return res.data!;
  },

  async getIncomeById(businessId: string, incomeId: string): Promise<IIncomeItem> {
    const res = (await apiClient.get(`/finance/income/${incomeId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IIncomeItem>;
    return res.data!;
  },

  async updateIncome(businessId: string, incomeId: string, data: any): Promise<IIncomeItem> {
    const res = (await apiClient.put(`/finance/income/${incomeId}`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IIncomeItem>;
    return res.data!;
  },

  /**
   * ============================================================================
   * MODULE 3: EXPENSE MANAGEMENT
   * ============================================================================
   */
  async listExpenseCategories(businessId: string): Promise<IExpenseCategoryItem[]> {
    const res = (await apiClient.get('/finance/expense-categories', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IExpenseCategoryItem[]>;
    return res.data || [];
  },

  async createExpenseCategory(businessId: string, data: any): Promise<IExpenseCategoryItem> {
    const res = (await apiClient.post('/finance/expense-categories', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IExpenseCategoryItem>;
    return res.data!;
  },

  async listExpenses(
    businessId: string,
    filters: { search?: string; category?: string; approvalStatus?: string; page?: number; limit?: number } = {}
  ): Promise<{ expenses: IExpenseItem[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/finance/expenses', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ expenses: IExpenseItem[]; total: number; page: number; totalPages: number }>;
    return res.data || { expenses: [], total: 0, page: 1, totalPages: 1 };
  },

  async createExpense(businessId: string, data: any): Promise<IExpenseItem> {
    const res = (await apiClient.post('/finance/expenses', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IExpenseItem>;
    return res.data!;
  },

  async approveExpense(businessId: string, expenseId: string): Promise<IExpenseItem> {
    const res = (await apiClient.patch(`/finance/expenses/${expenseId}/approve`, {}, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IExpenseItem>;
    return res.data!;
  },

  async rejectExpense(businessId: string, expenseId: string, reason?: string): Promise<IExpenseItem> {
    const res = (await apiClient.patch(
      `/finance/expenses/${expenseId}/reject`,
      { reason },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<IExpenseItem>;
    return res.data!;
  },

  async deleteExpense(businessId: string, expenseId: string): Promise<any> {
    const res = (await apiClient.delete(`/finance/expenses/${expenseId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 4 & 5: INVOICE MANAGEMENT & GST
   * ============================================================================
   */
  async listInvoices(
    businessId: string,
    filters: { search?: string; status?: string; customerId?: string; page?: number; limit?: number } = {}
  ): Promise<{ invoices: IInvoiceItemRecord[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/finance/invoices', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ invoices: IInvoiceItemRecord[]; total: number; page: number; totalPages: number }>;
    return res.data || { invoices: [], total: 0, page: 1, totalPages: 1 };
  },

  async createInvoice(businessId: string, data: any): Promise<IInvoiceItemRecord> {
    const res = (await apiClient.post('/finance/invoices', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IInvoiceItemRecord>;
    return res.data!;
  },

  async convertSalesOrderToInvoice(businessId: string, salesOrderId: string): Promise<IInvoiceItemRecord> {
    const res = (await apiClient.post(
      '/finance/invoices/convert-sales-order',
      { salesOrderId },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<IInvoiceItemRecord>;
    return res.data!;
  },

  async getInvoiceById(businessId: string, invoiceId: string): Promise<IInvoiceItemRecord> {
    const res = (await apiClient.get(`/finance/invoices/${invoiceId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IInvoiceItemRecord>;
    return res.data!;
  },

  async updateInvoice(businessId: string, invoiceId: string, data: any): Promise<IInvoiceItemRecord> {
    const res = (await apiClient.put(`/finance/invoices/${invoiceId}`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IInvoiceItemRecord>;
    return res.data!;
  },

  /**
   * ============================================================================
   * MODULE 6: PAYMENT MANAGEMENT
   * ============================================================================
   */
  async listPayments(
    businessId: string,
    filters: { search?: string; invoiceId?: string; customerId?: string; page?: number; limit?: number } = {}
  ): Promise<{ payments: IPaymentRecord[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/finance/payments', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ payments: IPaymentRecord[]; total: number; page: number; totalPages: number }>;
    return res.data || { payments: [], total: 0, page: 1, totalPages: 1 };
  },

  async recordPayment(businessId: string, data: any): Promise<IPaymentRecord> {
    const res = (await apiClient.post('/finance/payments', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IPaymentRecord>;
    return res.data!;
  },

  async recordRefund(businessId: string, data: any): Promise<any> {
    const res = (await apiClient.post('/finance/refunds', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 7 & 8: PROFIT & LOSS & FINANCIAL REPORTS
   * ============================================================================
   */
  async getProfitLossReport(
    businessId: string,
    filters: { startDate?: string; endDate?: string } = {}
  ): Promise<IProfitLossReportData> {
    const res = (await apiClient.get('/finance/reports/profit-loss', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IProfitLossReportData>;
    return (
      res.data || {
        period: '',
        startDate: '',
        endDate: '',
        operatingRevenue: { salesInvoicesTotal: 0, independentIncomeTotal: 0, grossRevenue: 0 },
        costOfGoodsAndExpenses: { inventoryPurchases: 0, payrollSalaries: 0, operatingExpenses: 0, totalExpenses: 0 },
        netOperatingIncome: 0,
        netProfit: 0,
        profitMarginPercent: 0
      }
    );
  },

  async getGstReport(
    businessId: string,
    filters: { startDate?: string; endDate?: string } = {}
  ): Promise<IGstReportData> {
    const res = (await apiClient.get('/finance/reports/gst', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IGstReportData>;
    return (
      res.data || {
        period: '',
        startDate: '',
        endDate: '',
        totalTaxableTurnover: 0,
        intraStateTurnover: 0,
        interStateTurnover: 0,
        taxSummary: { cgstTotal: 0, sgstTotal: 0, igstTotal: 0, totalGstCollected: 0 },
        hsnSummary: []
      }
    );
  },

  async listTransactions(
    businessId: string,
    filters: { search?: string; type?: string; page?: number; limit?: number } = {}
  ): Promise<{ transactions: IFinancialTransactionRecord[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/finance/transactions', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{
      transactions: IFinancialTransactionRecord[];
      total: number;
      page: number;
      totalPages: number;
    }>;
    return res.data || { transactions: [], total: 0, page: 1, totalPages: 1 };
  }
};

export default financeService;

