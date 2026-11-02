import mongoose, { Types } from 'mongoose';
import Income, { IIncomeDocument } from '../models/Income';
import Expense, { IExpenseDocument } from '../models/Expense';
import ExpenseCategory, { IExpenseCategoryDocument } from '../models/ExpenseCategory';
import Invoice, { IInvoiceDocument, IInvoiceItem } from '../models/Invoice';
import Payment, { IPaymentDocument } from '../models/Payment';
import Refund, { IRefundDocument } from '../models/Refund';
import FinancialTransaction, { IFinancialTransactionDocument } from '../models/FinancialTransaction';
import Business from '../models/Business';
import Customer from '../models/Customer';
import SalesOrder from '../models/SalesOrder';
import Payroll from '../models/Payroll';
import PurchaseOrder from '../models/PurchaseOrder';
import Notification from '../models/Notification';
import logger from '../utils/logger';
import { memCustomers } from './crmService';
import resilientAuthStore from './resilientAuthStore';
import {
  roundCurrency,
  addCurrency,
  subtractCurrency,
  multiplyCurrency
} from '../utils/currencyUtils';
import {
  IIncomeInput,
  IIncomeUpdateInput,
  IExpenseCategoryInput,
  IExpenseCategoryUpdateInput,
  IExpenseInput,
  IExpenseUpdateInput,
  IInvoiceCreateInput,
  IInvoiceUpdateInput,
  IPaymentCreateInput,
  IRefundCreateInput,
  IFinanceDashboardStats,
  IProfitLossReport,
  IGstReport
} from '../types';

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// In-Memory Fallback Stores for offline/resilient test execution
export const memIncomes: Map<string, any> = new Map();
export const memExpenseCategories: Map<string, any> = new Map();
export const memExpenses: Map<string, any> = new Map();
export const memInvoices: Map<string, any> = new Map();
export const memPayments: Map<string, any> = new Map();
export const memRefunds: Map<string, any> = new Map();
export const memFinancialTransactions: Map<string, any> = new Map();

let financeSeedDone = false;

/**
 * Seed default expense categories and initial records if empty
 */
async function seedDemoFinanceIfEmpty(businessId: string): Promise<void> {
  if (financeSeedDone) return;
  financeSeedDone = true;

  const defaultCategories = [
    { name: 'Rent & Utilities', code: 'EXP-RENT', description: 'Facility rent, power, water and internet' },
    { name: 'Salaries & Wages', code: 'EXP-PAY', description: 'Staff compensation and bonuses' },
    { name: 'Marketing & Advertising', code: 'EXP-MKT', description: 'Digital ads, campaigns, PR and branding' },
    { name: 'Software & Technology', code: 'EXP-TECH', description: 'Cloud servers, SaaS tools, and licenses' },
    { name: 'Office Supplies & Equipment', code: 'EXP-OPS', description: 'Hardware, stationary and office goods' },
    { name: 'Inventory & Procurement', code: 'EXP-PROC', description: 'Direct goods and raw material purchases' },
    { name: 'Legal & Professional Fees', code: 'EXP-LEGAL', description: 'Audit, legal advisory, and compliance' }
  ];

  if (isDbConnected()) {
    try {
      const bizId = new Types.ObjectId(businessId);
      const catCount = await ExpenseCategory.countDocuments({ businessId: bizId });
      if (catCount === 0) {
        await ExpenseCategory.insertMany(
          defaultCategories.map((c) => ({
            businessId: bizId,
            ...c,
            isTaxDeductible: true,
            isActive: true
          }))
        );
      }
    } catch (err: any) {
      logger.warn(`Failed to seed default expense categories in MongoDB: ${err?.message || err}`);
    }
  } else {
    defaultCategories.forEach((c, idx) => {
      const id = `exp_cat_${idx + 1}`;
      if (!memExpenseCategories.has(id)) {
        memExpenseCategories.set(id, {
          _id: id,
          businessId,
          ...c,
          isTaxDeductible: true,
          budgetLimit: 50000,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
  }
}

export class FinanceService {
  /**
   * ============================================================================
   * MODULE 1: FINANCE DASHBOARD
   * ============================================================================
   */
  static async getDashboardStats(businessId: string): Promise<IFinanceDashboardStats> {
    await seedDemoFinanceIfEmpty(businessId);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed

    if (isDbConnected()) {
      const bizId = new Types.ObjectId(businessId);

      // 1. Incomes
      const incomes = await Income.find({ businessId: bizId, status: 'RECORDED' }).lean();
      const totalIncome = incomes.reduce((sum, inc) => addCurrency(sum, inc.netAmount || inc.amount), 0);

      // 2. Payments Received (Invoice payments)
      const payments = await Payment.find({ businessId: bizId, status: 'COMPLETED' }).lean();
      const totalPaymentsReceived = payments.reduce((sum, p) => addCurrency(sum, p.amount), 0);

      // Avoid double counting: Total Revenue = Payments Received + Independent Incomes (where invoiceId is null)
      const independentIncomes = incomes.filter((i) => !i.invoiceId);
      const independentRevenue = independentIncomes.reduce((sum, inc) => addCurrency(sum, inc.netAmount || inc.amount), 0);
      const totalRevenue = addCurrency(totalPaymentsReceived, independentRevenue);

      // 3. Operational Expenses (Approved only, excluding payroll/inventory flags to prevent double-counting)
      const operationalExpenses = await Expense.find({
        businessId: bizId,
        approvalStatus: 'APPROVED',
        isPayroll: false,
        isInventoryPurchase: false
      }).lean();
      const totalOpExpenses = operationalExpenses.reduce((sum, e) => addCurrency(sum, e.totalAmount || e.amount), 0);

      // 4. Payroll Expenses (from Part 5)
      const paidPayrolls = await Payroll.find({ businessId: bizId, status: { $in: ['APPROVED', 'PAID'] } }).lean();
      const totalPayrollExpense = paidPayrolls.reduce((sum, p) => addCurrency(sum, p.totalNetSalary || 0), 0);

      // 5. Inventory Purchases (from Part 7 received purchase orders)
      const receivedPOs = await PurchaseOrder.find({ businessId: bizId, status: { $in: ['PARTIALLY_RECEIVED', 'RECEIVED'] } }).lean();
      const totalInventoryPurchases = receivedPOs.reduce((sum, po) => addCurrency(sum, po.totalAmount || 0), 0);

      const totalExpenses = addCurrency(totalOpExpenses, totalPayrollExpense, totalInventoryPurchases);
      const netProfit = subtractCurrency(totalRevenue, totalExpenses);
      const profitMarginPercent = totalRevenue > 0 ? roundCurrency((netProfit / totalRevenue) * 100) : 0;

      // 6. Invoices Metrics
      const invoices = await Invoice.find({ businessId: bizId, status: { $ne: 'CANCELLED' } }).lean();
      const totalInvoicesCount = invoices.length;
      const paidInvoicesCount = invoices.filter((i) => i.status === 'PAID' || (i as any).status === 'paid').length;
      const overdueInvoicesCount = invoices.filter((i) => {
        const isOverdueStatus = i.status === 'OVERDUE' || (i as any).status === 'overdue';
        const isPastDue = new Date(i.dueDate).getTime() < Date.now() && i.balanceDue > 0;
        return isOverdueStatus || isPastDue;
      }).length;

      const pendingPaymentsAmount = invoices
        .filter((i) => ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE', 'pending'].includes(i.status as string))
        .reduce((sum, i) => addCurrency(sum, i.balanceDue || 0), 0);

      const outstandingInvoicesAmount = pendingPaymentsAmount;

      // 7. Monthly calculations for current month
      const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
      const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

      const currentMonthPayments = payments
        .filter((p) => new Date(p.paymentDate) >= startOfCurrentMonth && new Date(p.paymentDate) <= endOfCurrentMonth)
        .reduce((sum, p) => addCurrency(sum, p.amount), 0);
      const currentMonthIndepIncome = independentIncomes
        .filter((i) => new Date(i.date) >= startOfCurrentMonth && new Date(i.date) <= endOfCurrentMonth)
        .reduce((sum, i) => addCurrency(sum, i.netAmount || i.amount), 0);
      const monthlyIncome = addCurrency(currentMonthPayments, currentMonthIndepIncome);

      const currentMonthExpenses = operationalExpenses
        .filter((e) => new Date(e.date) >= startOfCurrentMonth && new Date(e.date) <= endOfCurrentMonth)
        .reduce((sum, e) => addCurrency(sum, e.totalAmount || e.amount), 0);
      const monthlyExpenses = currentMonthExpenses;

      // 8. 6-Month Series
      const monthlyRevenueSeries: Array<{ month: string; income: number; expense: number; profit: number }> = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let m = 5; m >= 0; m--) {
        const d = new Date(currentYear, currentMonth - m, 1);
        const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

        const mInc = payments
          .filter((p) => new Date(p.paymentDate) >= mStart && new Date(p.paymentDate) <= mEnd)
          .reduce((sum, p) => addCurrency(sum, p.amount), 0);
        const mExp = operationalExpenses
          .filter((e) => new Date(e.date) >= mStart && new Date(e.date) <= mEnd)
          .reduce((sum, e) => addCurrency(sum, e.totalAmount || e.amount), 0);

        monthlyRevenueSeries.push({
          month: label,
          income: mInc,
          expense: mExp,
          profit: subtractCurrency(mInc, mExp)
        });
      }

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMarginPercent,
        pendingPaymentsAmount,
        receivedPaymentsAmount: totalPaymentsReceived,
        outstandingInvoicesAmount,
        overdueInvoicesCount,
        paidInvoicesCount,
        totalInvoicesCount,
        monthlyIncome,
        monthlyExpenses,
        monthlyRevenueSeries
      };
    }

    // In-memory calculation
    const incomes = Array.from(memIncomes.values()).filter((i) => i.businessId === businessId && i.status === 'RECORDED');
    const payments = Array.from(memPayments.values()).filter((p) => p.businessId === businessId && p.status === 'COMPLETED');
    const expenses = Array.from(memExpenses.values()).filter(
      (e) => e.businessId === businessId && e.approvalStatus === 'APPROVED' && !e.isPayroll && !e.isInventoryPurchase
    );
    const invoices = Array.from(memInvoices.values()).filter((i) => i.businessId === businessId && i.status !== 'CANCELLED');

    const totalPayments = payments.reduce((sum, p) => addCurrency(sum, p.amount || 0), 0);
    const indepIncomes = incomes.filter((i) => !i.invoiceId).reduce((sum, i) => addCurrency(sum, i.netAmount || i.amount || 0), 0);
    const totalRevenue = addCurrency(totalPayments, indepIncomes);
    const totalExpenses = expenses.reduce((sum, e) => addCurrency(sum, e.totalAmount || e.amount || 0), 0);
    const netProfit = subtractCurrency(totalRevenue, totalExpenses);
    const profitMarginPercent = totalRevenue > 0 ? roundCurrency((netProfit / totalRevenue) * 100) : 0;

    const pendingPaymentsAmount = invoices
      .filter((i) => ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE', 'pending'].includes(i.status))
      .reduce((sum, i) => addCurrency(sum, i.balanceDue || 0), 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMarginPercent,
      pendingPaymentsAmount,
      receivedPaymentsAmount: totalPayments,
      outstandingInvoicesAmount: pendingPaymentsAmount,
      overdueInvoicesCount: invoices.filter((i) => i.status === 'OVERDUE').length,
      paidInvoicesCount: invoices.filter((i) => i.status === 'PAID').length,
      totalInvoicesCount: invoices.length,
      monthlyIncome: totalRevenue,
      monthlyExpenses: totalExpenses,
      monthlyRevenueSeries: [
        { month: 'Oct 2026', income: totalRevenue, expense: totalExpenses, profit: netProfit }
      ]
    };
  }

  /**
   * ============================================================================
   * MODULE 2: INCOME MANAGEMENT
   * ============================================================================
   */
  static async createIncome(businessId: string, input: IIncomeInput, actorUserId?: string) {
    const grossAmount = roundCurrency(input.amount);
    const taxDeducted = roundCurrency(input.taxDeducted || 0);
    const netAmount = Math.max(0, subtractCurrency(grossAmount, taxDeducted));
    const incomeDate = input.date ? new Date(input.date) : new Date();

    if (isDbConnected()) {
      const count = await Income.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const year = incomeDate.getFullYear();
      const incomeNumber = `INC-${year}-${String(1001 + count).padStart(4, '0')}`;

      const income = await Income.create({
        businessId: new Types.ObjectId(businessId),
        incomeNumber,
        title: input.title.trim(),
        category: input.category.trim(),
        source: input.source.trim(),
        amount: grossAmount,
        taxDeducted,
        netAmount,
        date: incomeDate,
        paymentMethod: input.paymentMethod || 'BANK_TRANSFER',
        referenceNumber: input.referenceNumber?.trim() || '',
        customerId: input.customerId && Types.ObjectId.isValid(input.customerId) ? new Types.ObjectId(input.customerId) : null,
        invoiceId: input.invoiceId && Types.ObjectId.isValid(input.invoiceId) ? new Types.ObjectId(input.invoiceId) : null,
        notes: input.notes || '',
        recordedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined,
        status: 'RECORDED'
      });

      // Unified Financial Transaction audit ledger
      const txnCount = await FinancialTransaction.countDocuments({ businessId: new Types.ObjectId(businessId) });
      await FinancialTransaction.create({
        businessId: new Types.ObjectId(businessId),
        transactionNumber: `TXN-${year}-${String(1001 + txnCount).padStart(4, '0')}`,
        date: incomeDate,
        type: 'INCOME',
        category: input.category,
        amount: netAmount,
        debit: 0,
        credit: netAmount,
        referenceType: 'INCOME',
        referenceId: incomeNumber,
        paymentMethod: input.paymentMethod,
        description: `Income received: ${input.title} (${input.source})`,
        performedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined
      });

      return income;
    }

    // In-memory fallback
    const newId = `inc_${Date.now()}`;
    const incomeNumber = `INC-${incomeDate.getFullYear()}-${String(1001 + memIncomes.size).padStart(4, '0')}`;
    const income = {
      _id: newId,
      businessId,
      incomeNumber,
      ...input,
      amount: grossAmount,
      taxDeducted,
      netAmount,
      date: incomeDate,
      status: 'RECORDED',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memIncomes.set(newId, income);

    const txnId = `txn_${Date.now()}`;
    memFinancialTransactions.set(txnId, {
      _id: txnId,
      businessId,
      transactionNumber: `TXN-${incomeDate.getFullYear()}-${1000 + memFinancialTransactions.size + 1}`,
      date: incomeDate,
      type: 'INCOME',
      category: input.category,
      amount: netAmount,
      debit: 0,
      credit: netAmount,
      referenceType: 'INCOME',
      referenceId: incomeNumber,
      paymentMethod: input.paymentMethod,
      description: `Income received: ${input.title}`,
      createdAt: new Date()
    });

    return income;
  }

  static async listIncomes(
    businessId: string,
    filters: { search?: string; category?: string; status?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.category) query.category = filters.category;
      if (filters.status) query.status = filters.status;
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ title: regex }, { incomeNumber: regex }, { source: regex }, { referenceNumber: regex }];
      }

      const [incomes, total] = await Promise.all([
        Income.find(query)
          .populate('customerId', 'name fullName companyName email')
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Income.countDocuments(query)
      ]);

      return { incomes, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memIncomes.values()).filter((i) => i.businessId === businessId);
    if (filters.category) list = list.filter((i) => i.category === filters.category);
    if (filters.status) list = list.filter((i) => i.status === filters.status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((i) => i.title?.toLowerCase().includes(s) || i.incomeNumber?.toLowerCase().includes(s));
    }

    return {
      incomes: list.slice(skip, skip + limit),
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / limit)
    };
  }

  static async getIncomeById(businessId: string, incomeId: string) {
    if (isDbConnected()) {
      const income = await Income.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(incomeId)
      }).populate('customerId');
      if (!income) throw new Error('Income record not found.');
      return income;
    }
    const income = memIncomes.get(incomeId);
    if (!income) throw new Error('Income record not found.');
    return income;
  }

  static async updateIncome(businessId: string, incomeId: string, input: IIncomeUpdateInput) {
    if (isDbConnected()) {
      const income = await Income.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(incomeId)
      });
      if (!income) throw new Error('Income record not found.');

      if (input.amount !== undefined || input.taxDeducted !== undefined) {
        const amount = input.amount !== undefined ? roundCurrency(input.amount) : income.amount;
        const taxDeducted = input.taxDeducted !== undefined ? roundCurrency(input.taxDeducted) : income.taxDeducted;
        income.amount = amount;
        income.taxDeducted = taxDeducted;
        income.netAmount = Math.max(0, subtractCurrency(amount, taxDeducted));
      }

      if (input.title) income.title = input.title.trim();
      if (input.category) income.category = input.category.trim();
      if (input.source) income.source = input.source.trim();
      if (input.paymentMethod) income.paymentMethod = input.paymentMethod;
      if (input.referenceNumber !== undefined) income.referenceNumber = input.referenceNumber.trim();
      if (input.notes !== undefined) income.notes = input.notes;
      if (input.status) income.status = input.status;

      await income.save();
      return income;
    }

    const income = memIncomes.get(incomeId);
    if (!income) throw new Error('Income record not found.');
    Object.assign(income, input);
    if (input.amount !== undefined || input.taxDeducted !== undefined) {
      const amt = input.amount ?? income.amount;
      const tax = input.taxDeducted ?? income.taxDeducted;
      income.netAmount = Math.max(0, subtractCurrency(amt, tax));
    }
    income.updatedAt = new Date();
    return income;
  }

  /**
   * ============================================================================
   * MODULE 3: EXPENSE MANAGEMENT
   * ============================================================================
   */
  static async createExpenseCategory(businessId: string, input: IExpenseCategoryInput) {
    const code = input.code.trim().toUpperCase();
    if (isDbConnected()) {
      const existing = await ExpenseCategory.findOne({
        businessId: new Types.ObjectId(businessId),
        $or: [{ name: input.name.trim() }, { code }]
      });
      if (existing) throw new Error(`Expense category with name '${input.name}' or code '${code}' already exists.`);

      const cat = await ExpenseCategory.create({
        businessId: new Types.ObjectId(businessId),
        name: input.name.trim(),
        code,
        description: input.description || '',
        isTaxDeductible: input.isTaxDeductible !== false,
        budgetLimit: input.budgetLimit || 0,
        isActive: input.isActive !== false
      });
      return cat;
    }

    const newId = `exp_cat_${Date.now()}`;
    const cat = {
      _id: newId,
      businessId,
      ...input,
      code,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memExpenseCategories.set(newId, cat);
    return cat;
  }

  static async listExpenseCategories(businessId: string) {
    await seedDemoFinanceIfEmpty(businessId);
    if (isDbConnected()) {
      return ExpenseCategory.find({ businessId: new Types.ObjectId(businessId) }).sort({ name: 1 }).lean();
    }
    return Array.from(memExpenseCategories.values()).filter((c) => c.businessId === businessId);
  }

  static async createExpense(businessId: string, input: IExpenseInput, actorUserId?: string) {
    const grossAmount = roundCurrency(input.amount);
    const taxAmount = roundCurrency(input.taxAmount || 0);
    const totalAmount = addCurrency(grossAmount, taxAmount);
    const expDate = input.date ? new Date(input.date) : new Date();

    if (isDbConnected()) {
      const count = await Expense.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const year = expDate.getFullYear();
      const expenseNumber = `EXP-${year}-${String(1001 + count).padStart(4, '0')}`;

      const expense = await Expense.create({
        businessId: new Types.ObjectId(businessId),
        expenseNumber,
        title: input.title.trim(),
        categoryId: input.categoryId && Types.ObjectId.isValid(input.categoryId) ? new Types.ObjectId(input.categoryId) : undefined,
        category: input.category.trim(),
        amount: grossAmount,
        taxAmount,
        totalAmount,
        date: expDate,
        vendor: input.vendor?.trim() || '',
        vendorGstin: input.vendorGstin?.trim() || '',
        paymentMethod: input.paymentMethod || 'BANK_TRANSFER',
        reference: input.reference?.trim() || '',
        receiptUrl: input.receiptUrl?.trim() || '',
        description: input.description?.trim() || '',
        approvalStatus: 'APPROVED',
        approvedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined,
        approvedAt: new Date(),
        isPayroll: false,
        isInventoryPurchase: false,
        recordedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined
      });

      // Record in Financial Transaction ledger
      const txnCount = await FinancialTransaction.countDocuments({ businessId: new Types.ObjectId(businessId) });
      await FinancialTransaction.create({
        businessId: new Types.ObjectId(businessId),
        transactionNumber: `TXN-${year}-${String(1001 + txnCount).padStart(4, '0')}`,
        date: expDate,
        type: 'EXPENSE',
        category: input.category,
        amount: totalAmount,
        debit: totalAmount,
        credit: 0,
        referenceType: 'EXPENSE',
        referenceId: expenseNumber,
        paymentMethod: input.paymentMethod || 'BANK_TRANSFER',
        description: `Expense: ${input.title} (${input.vendor || 'Vendor'})`,
        performedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined
      });

      return expense;
    }

    const newId = `exp_${Date.now()}`;
    const expenseNumber = `EXP-${expDate.getFullYear()}-${String(1001 + memExpenses.size).padStart(4, '0')}`;
    const exp = {
      _id: newId,
      businessId,
      expenseNumber,
      ...input,
      amount: grossAmount,
      taxAmount,
      totalAmount,
      date: expDate,
      approvalStatus: 'PENDING',
      isPayroll: false,
      isInventoryPurchase: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memExpenses.set(newId, exp);

    const txnId = `txn_${Date.now()}`;
    memFinancialTransactions.set(txnId, {
      _id: txnId,
      businessId,
      transactionNumber: `TXN-${expDate.getFullYear()}-${1000 + memFinancialTransactions.size + 1}`,
      date: expDate,
      type: 'EXPENSE',
      category: input.category,
      amount: totalAmount,
      debit: totalAmount,
      credit: 0,
      referenceType: 'EXPENSE',
      referenceId: expenseNumber,
      paymentMethod: input.paymentMethod || 'BANK_TRANSFER',
      description: `Expense: ${input.title}`,
      createdAt: new Date()
    });

    return exp;
  }

  static async listExpenses(
    businessId: string,
    filters: { search?: string; category?: string; approvalStatus?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.category) query.category = filters.category;
      if (filters.approvalStatus) query.approvalStatus = filters.approvalStatus;
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ title: regex }, { expenseNumber: regex }, { vendor: regex }, { reference: regex }];
      }

      const [expenses, total] = await Promise.all([
        Expense.find(query)
          .populate('categoryId', 'name code')
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Expense.countDocuments(query)
      ]);

      return { expenses, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memExpenses.values()).filter((e) => e.businessId === businessId);
    if (filters.category) list = list.filter((e) => e.category === filters.category);
    if (filters.approvalStatus) list = list.filter((e) => e.approvalStatus === filters.approvalStatus);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((e) => e.title?.toLowerCase().includes(s) || e.vendor?.toLowerCase().includes(s));
    }

    return {
      expenses: list.slice(skip, skip + limit),
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / limit)
    };
  }

  static async approveExpense(businessId: string, expenseId: string, actorUserId?: string) {
    if (isDbConnected()) {
      const expense = await Expense.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(expenseId)
      });
      if (!expense) throw new Error('Expense record not found.');
      expense.approvalStatus = 'APPROVED';
      expense.approvedBy = actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined;
      expense.approvedAt = new Date();
      await expense.save();
      return expense;
    }

    const exp = memExpenses.get(expenseId);
    if (!exp) throw new Error('Expense record not found.');
    exp.approvalStatus = 'APPROVED';
    exp.updatedAt = new Date();
    return exp;
  }

  static async rejectExpense(businessId: string, expenseId: string, reason?: string) {
    if (isDbConnected()) {
      const expense = await Expense.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(expenseId)
      });
      if (!expense) throw new Error('Expense record not found.');
      expense.approvalStatus = 'REJECTED';
      expense.rejectionReason = reason || 'Rejected by finance manager';
      await expense.save();
      return expense;
    }

    const exp = memExpenses.get(expenseId);
    if (!exp) throw new Error('Expense record not found.');
    exp.approvalStatus = 'REJECTED';
    exp.rejectionReason = reason;
    exp.updatedAt = new Date();
    return exp;
  }

  static async deleteExpense(businessId: string, expenseId: string) {
    if (isDbConnected()) {
      const expense = await Expense.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(expenseId)
      });
      if (!expense) throw new Error('Expense record not found.');
      if (expense.isPayroll) {
        throw new Error('Cannot delete payroll expense directly. Payroll expenses must be managed via HR & Payroll module.');
      }
      if (expense.isInventoryPurchase) {
        throw new Error('Cannot delete inventory purchase expense directly. Inventory expenses must be managed via Purchase Orders.');
      }

      await Expense.deleteOne({ _id: expense._id });
      return { success: true, message: 'Expense removed successfully.' };
    }

    const exp = memExpenses.get(expenseId);
    if (exp?.isPayroll || exp?.isInventoryPurchase) {
      throw new Error('Cannot delete automated system expenses.');
    }
    memExpenses.delete(expenseId);
    return { success: true, message: 'Expense removed.' };
  }

  /**
   * ============================================================================
   * MODULE 4 & 5: INVOICE MANAGEMENT & INDIAN GST ENGINE
   * ============================================================================
   */
  static async createInvoice(businessId: string, input: IInvoiceCreateInput, actorUserId?: string) {
    let bizState = 'Maharashtra';
    let custState = 'Maharashtra';
    let businessSnapshot: any = { name: 'Nexus Technologies Inc.', gstin: '27AAACB2234K1Z1' };
    let customerSnapshot: any = { name: 'Valued Customer', email: 'client@example.com' };

    if (isDbConnected()) {
      const biz = await Business.findById(businessId).lean();
      if (biz) {
        bizState = biz.address?.state || 'Maharashtra';
        businessSnapshot = {
          name: biz.name,
          legalName: biz.legalName || biz.name,
          gstin: biz.gstin || '',
          email: biz.businessEmail || biz.contactEmail || '',
          phone: biz.phone || '',
          address: biz.address,
          logo: biz.logo
        };
      }

      const cust = await Customer.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(input.customerId)
      }).lean();

      if (!cust) throw new Error(`Customer with ID ${input.customerId} not found.`);
      custState = cust.address?.state || bizState;
      customerSnapshot = {
        name: cust.fullName || cust.name,
        companyName: cust.companyName || '',
        email: cust.email,
        phone: cust.phone || '',
        gstin: cust.gstin || '',
        address: cust.address
      };
    } else {
      const memBusinesses = resilientAuthStore.getInMemoryBusinesses();
      const biz = memBusinesses.get(businessId) || Array.from(memBusinesses.values())[0];
      if (biz) {
        bizState = (biz as any).address?.state || 'Maharashtra';
        businessSnapshot = {
          name: biz.name,
          legalName: (biz as any).legalName || biz.name,
          gstin: biz.gstin || '27AAACB2234K1Z1',
          email: biz.businessEmail || '',
          phone: biz.phone || '',
          address: (biz as any).address || { state: bizState },
          logo: biz.logo
        };
      }

      const cust =
        memCustomers.get(input.customerId) ||
        Array.from(memCustomers.values()).find((c) => c._id === input.customerId || c.customerId === input.customerId);

      if (cust) {
        custState = cust.address?.state || bizState;
        customerSnapshot = {
          name: cust.fullName || cust.name,
          companyName: cust.companyName || '',
          email: cust.email,
          phone: cust.phone || '',
          gstin: cust.gstin || '',
          address: cust.address
        };
      }
    }

    // Determine GST intra-state vs inter-state
    const normalizedBizState = bizState.trim().toLowerCase();
    const normalizedCustState = custState.trim().toLowerCase();
    const isInterState = normalizedBizState !== normalizedCustState;

    // Calculate line items with exact decimal-safe arithmetic
    let totalSubtotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxableAmount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let grandTotal = 0;

    const calculatedItems: IInvoiceItem[] = input.items.map((it) => {
      const qty = Math.max(1, it.quantity);
      const price = roundCurrency(it.unitPrice);
      const disc = roundCurrency(it.discount || 0);
      const lineGross = multiplyCurrency(qty, price);
      const taxable = Math.max(0, subtractCurrency(lineGross, disc));
      const taxRate = Math.max(0, it.taxRate || 0);

      let cgstRate = 0;
      let cgstAmount = 0;
      let sgstRate = 0;
      let sgstAmount = 0;
      let igstRate = 0;
      let igstAmount = 0;

      if (!isInterState) {
        // Intra-state: Split 50/50 between CGST and SGST
        cgstRate = roundCurrency(taxRate / 2);
        sgstRate = roundCurrency(taxRate / 2);
        cgstAmount = roundCurrency((taxable * cgstRate) / 100);
        sgstAmount = roundCurrency((taxable * sgstRate) / 100);
      } else {
        // Inter-state: Full tax under IGST
        igstRate = taxRate;
        igstAmount = roundCurrency((taxable * igstRate) / 100);
      }

      const lineTax = addCurrency(cgstAmount, sgstAmount, igstAmount);
      const lineTotal = addCurrency(taxable, lineTax);

      totalSubtotal = addCurrency(totalSubtotal, lineGross);
      totalDiscountAmount = addCurrency(totalDiscountAmount, disc);
      totalTaxableAmount = addCurrency(totalTaxableAmount, taxable);
      totalCgst = addCurrency(totalCgst, cgstAmount);
      totalSgst = addCurrency(totalSgst, sgstAmount);
      totalIgst = addCurrency(totalIgst, igstAmount);

      return {
        productId: it.productId,
        name: it.name.trim(),
        description: it.description?.trim() || '',
        hsnSacCode: it.hsnSacCode?.trim() || '8471',
        quantity: qty,
        unit: it.unit || 'units',
        unitPrice: price,
        discount: disc,
        taxableAmount: taxable,
        taxRate,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        totalTaxAmount: lineTax,
        lineTotal
      };
    });

    const totalTaxAmount = addCurrency(totalCgst, totalSgst, totalIgst);
    const shipping = roundCurrency(input.shippingCharges || 0);
    const other = roundCurrency(input.otherCharges || 0);
    grandTotal = addCurrency(totalTaxableAmount, totalTaxAmount, shipping, other);

    const invDate = input.invoiceDate ? new Date(input.invoiceDate) : new Date();
    const dueDate = new Date(input.dueDate);

    if (isDbConnected()) {
      const year = invDate.getFullYear();
      const count = await Invoice.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const invoiceNumber = `INV-${year}-${String(1001 + count).padStart(4, '0')}`;

      const invoice = await Invoice.create({
        businessId: new Types.ObjectId(businessId),
        invoiceNumber,
        customerId: new Types.ObjectId(input.customerId),
        salesOrderId: input.salesOrderId && Types.ObjectId.isValid(input.salesOrderId) ? new Types.ObjectId(input.salesOrderId) : null,
        customerName: customerSnapshot.name,
        customerEmail: customerSnapshot.email,
        businessSnapshot,
        customerSnapshot,
        invoiceDate: invDate,
        dueDate,
        items: calculatedItems,
        subtotal: totalSubtotal,
        discountAmount: totalDiscountAmount,
        taxableAmount: totalTaxableAmount,
        isInterState,
        cgstTotal: totalCgst,
        sgstTotal: totalSgst,
        igstTotal: totalIgst,
        totalTaxAmount,
        tax: totalTaxAmount,
        shippingCharges: shipping,
        otherCharges: other,
        grandTotal,
        totalAmount: grandTotal,
        amountPaid: 0,
        balanceDue: grandTotal,
        status: 'ISSUED',
        paymentTerms: input.paymentTerms || 'NET_30',
        notes: input.notes || '',
        termsAndConditions: input.termsAndConditions || 'Payment due within invoice terms.',
        finalizedAt: new Date(),
        createdBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined
      });

      // Notification
      if (actorUserId && Types.ObjectId.isValid(actorUserId)) {
        await Notification.create({
          businessId: new Types.ObjectId(businessId),
          recipientUserId: new Types.ObjectId(actorUserId),
          title: 'Invoice Generated',
          message: `Invoice ${invoiceNumber} issued for ${customerSnapshot.name} (₹${grandTotal.toLocaleString()}).`,
          type: 'INVOICE'
        });
      }

      return invoice;
    }

    // In-memory fallback
    const newId = `inv_${Date.now()}`;
    const invoiceNumber = `INV-${invDate.getFullYear()}-${String(1001 + memInvoices.size).padStart(4, '0')}`;
    const invoice = {
      _id: newId,
      businessId,
      invoiceNumber,
      customerId: input.customerId,
      customerName: customerSnapshot.name,
      customerEmail: customerSnapshot.email,
      businessSnapshot,
      customerSnapshot,
      invoiceDate: invDate,
      dueDate,
      items: calculatedItems,
      subtotal: totalSubtotal,
      discountAmount: totalDiscountAmount,
      taxableAmount: totalTaxableAmount,
      isInterState,
      cgstTotal: totalCgst,
      sgstTotal: totalSgst,
      igstTotal: totalIgst,
      totalTaxAmount,
      shippingCharges: shipping,
      otherCharges: other,
      grandTotal,
      amountPaid: 0,
      balanceDue: grandTotal,
      status: 'ISSUED',
      paymentTerms: input.paymentTerms || 'NET_30',
      notes: input.notes || '',
      finalizedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memInvoices.set(newId, invoice);
    return invoice;
  }

  static async convertSalesOrderToInvoice(businessId: string, salesOrderId: string, actorUserId?: string) {
    if (isDbConnected()) {
      const order = await SalesOrder.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(salesOrderId)
      });
      if (!order) throw new Error('Sales order not found.');

      // Check if invoice already created for this order
      const existing = await Invoice.findOne({
        businessId: new Types.ObjectId(businessId),
        salesOrderId: order._id
      });
      if (existing) return existing;

      return this.createInvoice(
        businessId,
        {
          customerId: order.customerId.toString(),
          salesOrderId: order._id.toString(),
          dueDate: new Date(Date.now() + 30 * 86400000),
          items: order.items.map((it: any) => ({
            productId: it.productId?.toString(),
            name: it.productName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discount: it.discount || 0,
            taxRate: it.tax || 18,
            hsnSacCode: '8471'
          })),
          shippingCharges: order.shippingFee || 0,
          notes: `Generated from Sales Order ${order.orderNumber}`
        },
        actorUserId
      );
    }

    return this.createInvoice(businessId, {
      customerId: 'cust_default',
      dueDate: new Date(Date.now() + 30 * 86400000),
      items: [{ name: 'Enterprise License', quantity: 1, unitPrice: 5000, taxRate: 18, hsnSacCode: '9983' }],
      notes: 'Generated from sales order'
    });
  }

  static async listInvoices(
    businessId: string,
    filters: { search?: string; status?: string; customerId?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.status) query.status = filters.status;
      if (filters.customerId && Types.ObjectId.isValid(filters.customerId)) {
        query.customerId = new Types.ObjectId(filters.customerId);
      }
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ invoiceNumber: regex }, { customerName: regex }, { customerEmail: regex }];
      }

      const [invoices, total] = await Promise.all([
        Invoice.find(query)
          .populate('customerId', 'fullName companyName email phone gstin')
          .sort({ invoiceDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Invoice.countDocuments(query)
      ]);

      return { invoices, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memInvoices.values()).filter((i) => i.businessId === businessId);
    if (filters.status) list = list.filter((i) => i.status === filters.status);
    if (filters.customerId) list = list.filter((i) => i.customerId === filters.customerId);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((i) => i.invoiceNumber?.toLowerCase().includes(s) || i.customerName?.toLowerCase().includes(s));
    }

    return {
      invoices: list.slice(skip, skip + limit),
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / limit)
    };
  }

  static async getInvoiceById(businessId: string, invoiceId: string) {
    if (isDbConnected()) {
      const invoice = await Invoice.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(invoiceId)
      }).populate('customerId');
      if (!invoice) throw new Error('Invoice not found.');
      return invoice;
    }

    const inv = memInvoices.get(invoiceId);
    if (!inv) throw new Error('Invoice not found.');
    return inv;
  }

  static async updateInvoice(businessId: string, invoiceId: string, input: IInvoiceUpdateInput) {
    if (isDbConnected()) {
      const invoice = await Invoice.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(invoiceId)
      });
      if (!invoice) throw new Error('Invoice not found.');

      if (input.dueDate) invoice.dueDate = new Date(input.dueDate);
      if (input.notes !== undefined) invoice.notes = input.notes;
      if (input.termsAndConditions !== undefined) invoice.termsAndConditions = input.termsAndConditions;
      if (input.status) invoice.status = input.status;

      await invoice.save();
      return invoice;
    }

    const inv = memInvoices.get(invoiceId);
    if (!inv) throw new Error('Invoice not found.');
    Object.assign(inv, input);
    inv.updatedAt = new Date();
    return inv;
  }

  /**
   * ============================================================================
   * MODULE 6: PAYMENT MANAGEMENT & RECONCILIATION
   * ============================================================================
   */
  static async recordPayment(businessId: string, input: IPaymentCreateInput, actorUserId?: string) {
    const amount = roundCurrency(input.amount);
    if (amount <= 0) throw new Error('Payment amount must be greater than zero.');
    if (!input.referenceNumber || input.referenceNumber.trim().length === 0) {
      throw new Error('Reference number / transaction confirmation is required.');
    }

    const payDate = input.paymentDate ? new Date(input.paymentDate) : new Date();

    if (isDbConnected()) {
      const count = await Payment.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const year = payDate.getFullYear();
      const paymentNumber = `PAY-${year}-${String(1001 + count).padStart(4, '0')}`;

      let customerName = 'Direct Client';
      let customerIdObj: Types.ObjectId | null = null;
      let invoiceObj: any = null;

      if (input.invoiceId && Types.ObjectId.isValid(input.invoiceId)) {
        invoiceObj = await Invoice.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: new Types.ObjectId(input.invoiceId)
        });

        if (!invoiceObj) throw new Error('Associated invoice not found.');
        if (amount > invoiceObj.balanceDue) {
          throw new Error(`Payment amount (₹${amount}) cannot exceed outstanding balance due (₹${invoiceObj.balanceDue}).`);
        }
        customerName = invoiceObj.customerName;
        customerIdObj = invoiceObj.customerId;

        // Apply payment to invoice
        const currentPaid = invoiceObj.amountPaid || 0;
        const newPaid = addCurrency(currentPaid, amount);
        invoiceObj.amountPaid = newPaid;
        invoiceObj.balanceDue = Math.max(0, subtractCurrency(invoiceObj.grandTotal, newPaid));

        if (invoiceObj.balanceDue <= 0) {
          invoiceObj.status = 'PAID';
          invoiceObj.paidAt = payDate;
        } else {
          invoiceObj.status = 'PARTIALLY_PAID';
        }
        await invoiceObj.save();
      } else if (input.customerId && Types.ObjectId.isValid(input.customerId)) {
        const cust = await Customer.findById(input.customerId);
        if (cust) {
          customerName = cust.fullName || cust.name;
          customerIdObj = cust._id;
        }
      }

      const payment = await Payment.create({
        businessId: new Types.ObjectId(businessId),
        paymentNumber,
        invoiceId: invoiceObj ? invoiceObj._id : undefined,
        customerId: customerIdObj,
        customerName,
        amount,
        paymentDate: payDate,
        paymentMethod: input.paymentMethod,
        referenceNumber: input.referenceNumber.trim(),
        status: 'COMPLETED',
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined,
        notes: input.notes || '',
        receivedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined
      });

      // Unified Financial Transaction audit ledger entry
      const txnCount = await FinancialTransaction.countDocuments({ businessId: new Types.ObjectId(businessId) });
      await FinancialTransaction.create({
        businessId: new Types.ObjectId(businessId),
        transactionNumber: `TXN-${year}-${String(1001 + txnCount).padStart(4, '0')}`,
        date: payDate,
        type: 'PAYMENT_RECEIVED',
        category: 'Client Invoicing',
        amount,
        debit: 0,
        credit: amount,
        referenceType: 'PAYMENT',
        referenceId: paymentNumber,
        paymentMethod: input.paymentMethod,
        description: `Payment received for ${invoiceObj ? invoiceObj.invoiceNumber : 'account'}: ₹${amount.toLocaleString()}`,
        performedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined
      });

      return payment;
    }

    // In-memory fallback
    const newId = `pay_${Date.now()}`;
    const paymentNumber = `PAY-${payDate.getFullYear()}-${String(1001 + memPayments.size).padStart(4, '0')}`;
    let customerName = 'Valued Customer';

    if (input.invoiceId) {
      const inv = memInvoices.get(input.invoiceId);
      if (!inv) throw new Error('Associated invoice not found.');
      if (amount > inv.balanceDue) {
        throw new Error(`Payment amount (₹${amount}) cannot exceed outstanding balance due (₹${inv.balanceDue}).`);
      }
      customerName = inv.customerName;
      const currentPaid = inv.amountPaid || 0;
      const newPaid = addCurrency(currentPaid, amount);
      inv.amountPaid = newPaid;
      inv.balanceDue = Math.max(0, subtractCurrency(inv.grandTotal, newPaid));
      inv.status = inv.balanceDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';
      if (inv.status === 'PAID') inv.paidAt = payDate;
      inv.updatedAt = new Date();
    }

    const pay = {
      _id: newId,
      businessId,
      paymentNumber,
      invoiceId: input.invoiceId,
      customerId: input.customerId,
      customerName,
      amount,
      paymentDate: payDate,
      paymentMethod: input.paymentMethod,
      referenceNumber: input.referenceNumber,
      status: 'COMPLETED',
      isVerified: true,
      verifiedAt: new Date(),
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memPayments.set(newId, pay);

    const txnId = `txn_${Date.now()}`;
    memFinancialTransactions.set(txnId, {
      _id: txnId,
      businessId,
      transactionNumber: `TXN-${payDate.getFullYear()}-${1000 + memFinancialTransactions.size + 1}`,
      date: payDate,
      type: 'PAYMENT_RECEIVED',
      category: 'Invoicing',
      amount,
      debit: 0,
      credit: amount,
      referenceType: 'PAYMENT',
      referenceId: paymentNumber,
      paymentMethod: input.paymentMethod,
      description: `Payment confirmed: ${paymentNumber}`,
      createdAt: new Date()
    });

    return pay;
  }

  static async listPayments(
    businessId: string,
    filters: { search?: string; invoiceId?: string; customerId?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.invoiceId && Types.ObjectId.isValid(filters.invoiceId)) {
        query.invoiceId = new Types.ObjectId(filters.invoiceId);
      }
      if (filters.customerId && Types.ObjectId.isValid(filters.customerId)) {
        query.customerId = new Types.ObjectId(filters.customerId);
      }
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ paymentNumber: regex }, { customerName: regex }, { referenceNumber: regex }];
      }

      const [payments, total] = await Promise.all([
        Payment.find(query)
          .populate('invoiceId', 'invoiceNumber grandTotal status')
          .sort({ paymentDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Payment.countDocuments(query)
      ]);

      return { payments, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memPayments.values()).filter((p) => p.businessId === businessId);
    if (filters.invoiceId) list = list.filter((p) => p.invoiceId === filters.invoiceId);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((p) => p.paymentNumber?.toLowerCase().includes(s) || p.referenceNumber?.toLowerCase().includes(s));
    }

    return {
      payments: list.slice(skip, skip + limit),
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / limit)
    };
  }

  static async recordRefund(businessId: string, input: IRefundCreateInput, actorUserId?: string) {
    const refundAmount = roundCurrency(input.amount);
    if (refundAmount <= 0) throw new Error('Refund amount must be positive.');

    const refundDate = input.refundDate ? new Date(input.refundDate) : new Date();

    if (isDbConnected()) {
      const count = await Refund.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const year = refundDate.getFullYear();
      const refundNumber = `REF-${year}-${String(1001 + count).padStart(4, '0')}`;

      if (input.invoiceId && Types.ObjectId.isValid(input.invoiceId)) {
        const inv = await Invoice.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: new Types.ObjectId(input.invoiceId)
        });
        if (inv) {
          inv.amountPaid = Math.max(0, subtractCurrency(inv.amountPaid, refundAmount));
          inv.balanceDue = subtractCurrency(inv.grandTotal, inv.amountPaid);
          inv.status = inv.amountPaid <= 0 ? 'ISSUED' : 'PARTIALLY_PAID';
          await inv.save();
        }
      }

      const refund = await Refund.create({
        businessId: new Types.ObjectId(businessId),
        refundNumber,
        paymentId: input.paymentId && Types.ObjectId.isValid(input.paymentId) ? new Types.ObjectId(input.paymentId) : undefined,
        invoiceId: input.invoiceId && Types.ObjectId.isValid(input.invoiceId) ? new Types.ObjectId(input.invoiceId) : undefined,
        amount: refundAmount,
        refundDate,
        reason: input.reason.trim(),
        refundMethod: input.refundMethod || 'BANK_TRANSFER',
        referenceNumber: input.referenceNumber.trim(),
        status: 'PROCESSED',
        approvedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined,
        notes: input.notes || ''
      });

      // Log financial transaction debit
      const txnCount = await FinancialTransaction.countDocuments({ businessId: new Types.ObjectId(businessId) });
      await FinancialTransaction.create({
        businessId: new Types.ObjectId(businessId),
        transactionNumber: `TXN-${year}-${String(1001 + txnCount).padStart(4, '0')}`,
        date: refundDate,
        type: 'REFUND_ISSUED',
        category: 'Client Refunds',
        amount: refundAmount,
        debit: refundAmount,
        credit: 0,
        referenceType: 'REFUND',
        referenceId: refundNumber,
        paymentMethod: input.refundMethod || 'BANK_TRANSFER',
        description: `Refund issued: ${input.reason}`,
        performedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined
      });

      return refund;
    }

    const newId = `ref_${Date.now()}`;
    const refundNumber = `REF-${refundDate.getFullYear()}-${String(1001 + memRefunds.size).padStart(4, '0')}`;

    if (input.invoiceId) {
      const inv = memInvoices.get(input.invoiceId);
      if (inv) {
        inv.amountPaid = Math.max(0, subtractCurrency(inv.amountPaid || 0, refundAmount));
        inv.balanceDue = subtractCurrency(inv.grandTotal, inv.amountPaid);
        inv.status = inv.amountPaid <= 0 ? 'ISSUED' : 'PARTIALLY_PAID';
        inv.updatedAt = new Date();
      }
    }

    const ref = {
      _id: newId,
      businessId,
      refundNumber,
      ...input,
      amount: refundAmount,
      refundDate,
      status: 'PROCESSED',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memRefunds.set(newId, ref);
    return ref;
  }

  /**
   * ============================================================================
   * MODULE 7 & 8: PROFIT & LOSS ENGINE & FINANCIAL REPORTS
   * ============================================================================
   */
  static async getProfitLossReport(
    businessId: string,
    filters: { startDate?: string; endDate?: string } = {}
  ): Promise<IProfitLossReport> {
    const sDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const eDate = filters.endDate ? new Date(filters.endDate) : new Date();

    if (isDbConnected()) {
      const bizId = new Types.ObjectId(businessId);
      const dateFilter = { $gte: sDate, $lte: eDate };

      // 1. Invoices Revenue (Paid or finalized invoices issued in period)
      const invoices = await Invoice.find({
        businessId: bizId,
        invoiceDate: dateFilter,
        status: { $ne: 'CANCELLED' }
      }).lean();
      const salesInvoicesTotal = invoices.reduce((sum, inv) => addCurrency(sum, inv.taxableAmount || inv.subtotal), 0);

      // 2. Independent Income entries
      const independentIncomes = await Income.find({
        businessId: bizId,
        date: dateFilter,
        status: 'RECORDED',
        invoiceId: null
      }).lean();
      const independentIncomeTotal = independentIncomes.reduce((sum, inc) => addCurrency(sum, inc.netAmount || inc.amount), 0);

      const grossRevenue = addCurrency(salesInvoicesTotal, independentIncomeTotal);

      // 3. Operational Expenses
      const opExpenses = await Expense.find({
        businessId: bizId,
        date: dateFilter,
        approvalStatus: 'APPROVED',
        isPayroll: false,
        isInventoryPurchase: false
      }).lean();
      const operatingExpenses = opExpenses.reduce((sum, exp) => addCurrency(sum, exp.amount), 0);

      // 4. Payroll Expenses (from Part 5)
      const payrolls = await Payroll.find({
        businessId: bizId,
        status: { $in: ['APPROVED', 'PAID'] }
      }).lean();
      const payrollSalaries = payrolls.reduce((sum, pay) => addCurrency(sum, pay.totalNetSalary || 0), 0);

      // 5. Inventory Purchases (from Part 7 received POs)
      const purchaseOrders = await PurchaseOrder.find({
        businessId: bizId,
        status: { $in: ['PARTIALLY_RECEIVED', 'RECEIVED'] }
      }).lean();
      const inventoryPurchases = purchaseOrders.reduce((sum, po) => addCurrency(sum, po.subtotal || po.totalAmount), 0);

      const totalExpenses = addCurrency(operatingExpenses, payrollSalaries, inventoryPurchases);
      const netProfit = subtractCurrency(grossRevenue, totalExpenses);
      const profitMarginPercent = grossRevenue > 0 ? roundCurrency((netProfit / grossRevenue) * 100) : 0;

      return {
        period: `${sDate.toISOString().split('T')[0]} to ${eDate.toISOString().split('T')[0]}`,
        startDate: sDate.toISOString(),
        endDate: eDate.toISOString(),
        operatingRevenue: {
          salesInvoicesTotal,
          independentIncomeTotal,
          grossRevenue
        },
        costOfGoodsAndExpenses: {
          inventoryPurchases,
          payrollSalaries,
          operatingExpenses,
          totalExpenses
        },
        netOperatingIncome: netProfit,
        netProfit,
        profitMarginPercent
      };
    }

    // In-memory fallback calculation
    const invs = Array.from(memInvoices.values()).filter((i) => i.businessId === businessId && i.status !== 'CANCELLED');
    const salesInvoicesTotal = invs.reduce((sum, i) => addCurrency(sum, i.taxableAmount || i.subtotal || 0), 0);

    const incs = Array.from(memIncomes.values()).filter((i) => i.businessId === businessId && i.status === 'RECORDED' && !i.invoiceId);
    const independentIncomeTotal = incs.reduce((sum, i) => addCurrency(sum, i.netAmount || i.amount || 0), 0);
    const grossRevenue = addCurrency(salesInvoicesTotal, independentIncomeTotal);

    const exps = Array.from(memExpenses.values()).filter(
      (e) => e.businessId === businessId && e.approvalStatus === 'APPROVED' && !e.isPayroll && !e.isInventoryPurchase
    );
    const operatingExpenses = exps.reduce((sum, e) => addCurrency(sum, e.amount || 0), 0);
    const totalExpenses = operatingExpenses;
    const netProfit = subtractCurrency(grossRevenue, totalExpenses);

    return {
      period: 'Fiscal Year 2026',
      startDate: sDate.toISOString(),
      endDate: eDate.toISOString(),
      operatingRevenue: {
        salesInvoicesTotal,
        independentIncomeTotal,
        grossRevenue
      },
      costOfGoodsAndExpenses: {
        inventoryPurchases: 0,
        payrollSalaries: 0,
        operatingExpenses,
        totalExpenses
      },
      netOperatingIncome: netProfit,
      netProfit,
      profitMarginPercent: grossRevenue > 0 ? roundCurrency((netProfit / grossRevenue) * 100) : 0
    };
  }

  static async getGstReport(
    businessId: string,
    filters: { startDate?: string; endDate?: string } = {}
  ): Promise<IGstReport> {
    const sDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const eDate = filters.endDate ? new Date(filters.endDate) : new Date();

    let invoices: any[] = [];
    if (isDbConnected()) {
      invoices = await Invoice.find({
        businessId: new Types.ObjectId(businessId),
        status: { $in: ['ISSUED', 'PARTIALLY_PAID', 'PAID'] },
        invoiceDate: { $gte: sDate, $lte: eDate }
      }).lean();
    } else {
      invoices = Array.from(memInvoices.values()).filter(
        (i) => i.businessId === businessId && ['ISSUED', 'PARTIALLY_PAID', 'PAID'].includes(i.status)
      );
    }

    let totalTaxableTurnover = 0;
    let intraStateTurnover = 0;
    let interStateTurnover = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const hsnMap: Map<string, { hsnSacCode: string; description: string; taxableValue: number; taxRate: number; cgstAmount: number; sgstAmount: number; igstAmount: number; totalTax: number }> = new Map();

    for (const inv of invoices) {
      const taxable = inv.taxableAmount || inv.subtotal || 0;
      totalTaxableTurnover = addCurrency(totalTaxableTurnover, taxable);

      if (inv.isInterState) {
        interStateTurnover = addCurrency(interStateTurnover, taxable);
      } else {
        intraStateTurnover = addCurrency(intraStateTurnover, taxable);
      }

      cgstTotal = addCurrency(cgstTotal, inv.cgstTotal || 0);
      sgstTotal = addCurrency(sgstTotal, inv.sgstTotal || 0);
      igstTotal = addCurrency(igstTotal, inv.igstTotal || 0);

      // Aggregate HSN / SAC summary
      if (inv.items && Array.isArray(inv.items)) {
        for (const it of inv.items) {
          const code = it.hsnSacCode || '8471';
          const existing = hsnMap.get(code) || {
            hsnSacCode: code,
            description: it.description || it.name,
            taxableValue: 0,
            taxRate: it.taxRate || 18,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            totalTax: 0
          };

          existing.taxableValue = addCurrency(existing.taxableValue, it.taxableAmount || 0);
          existing.cgstAmount = addCurrency(existing.cgstAmount, it.cgstAmount || 0);
          existing.sgstAmount = addCurrency(existing.sgstAmount, it.sgstAmount || 0);
          existing.igstAmount = addCurrency(existing.igstAmount, it.igstAmount || 0);
          existing.totalTax = addCurrency(existing.totalTax, it.totalTaxAmount || 0);
          hsnMap.set(code, existing);
        }
      }
    }

    return {
      period: `${sDate.toISOString().split('T')[0]} to ${eDate.toISOString().split('T')[0]}`,
      startDate: sDate.toISOString(),
      endDate: eDate.toISOString(),
      totalTaxableTurnover,
      intraStateTurnover,
      interStateTurnover,
      taxSummary: {
        cgstTotal,
        sgstTotal,
        igstTotal,
        totalGstCollected: addCurrency(cgstTotal, sgstTotal, igstTotal)
      },
      hsnSummary: Array.from(hsnMap.values())
    };
  }

  static async listTransactions(
    businessId: string,
    filters: { search?: string; type?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.type) query.type = filters.type;
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ transactionNumber: regex }, { description: regex }, { referenceId: regex }];
      }

      const [transactions, total] = await Promise.all([
        FinancialTransaction.find(query)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        FinancialTransaction.countDocuments(query)
      ]);

      return { transactions, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memFinancialTransactions.values()).filter((t) => t.businessId === businessId);
    if (filters.type) list = list.filter((t) => t.type === filters.type);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((t) => t.description?.toLowerCase().includes(s) || t.transactionNumber?.toLowerCase().includes(s));
    }

    return {
      transactions: list.slice(skip, skip + limit),
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / limit)
    };
  }
}

export default FinanceService;
