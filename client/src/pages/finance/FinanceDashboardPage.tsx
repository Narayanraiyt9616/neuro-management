import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import financeService from '../../services/financeService';
import {
  IFinanceDashboardStatsData,
  IIncomeItem,
  IExpenseItem,
  IExpenseCategoryItem,
  IFinancialTransactionRecord,
  IProfitLossReportData,
  IGstReportData
} from '../../types';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  FileCheck2,
  PieChart,
  Download,
  AlertCircle,
  X,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from 'lucide-react';

export const FinanceDashboardPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Active Tab: 'overview' | 'income' | 'expenses' | 'gst' | 'transactions' | 'reports'
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'gst' | 'transactions' | 'reports'>('overview');

  // Core Data States
  const [stats, setStats] = useState<IFinanceDashboardStatsData | null>(null);
  const [incomes, setIncomes] = useState<IIncomeItem[]>([]);
  const [expenses, setExpenses] = useState<IExpenseItem[]>([]);
  const [categories, setCategories] = useState<IExpenseCategoryItem[]>([]);
  const [transactions, setTransactions] = useState<IFinancialTransactionRecord[]>([]);
  const [pnlReport, setPnlReport] = useState<IProfitLossReportData | null>(null);
  const [gstReport, setGstReport] = useState<IGstReportData | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Forms
  const [incomeForm, setIncomeForm] = useState({
    title: '',
    category: 'Product Sales',
    source: 'Direct Client',
    amount: 0,
    taxDeducted: 0,
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Operations',
    amount: 0,
    taxAmount: 0,
    vendor: '',
    vendorGstin: '',
    paymentMethod: 'BANK_TRANSFER',
    reference: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: '',
    description: '',
    budgetLimit: 0
  });

  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  const clearAlerts = () => {
    setAlertSuccess(null);
    setAlertError(null);
  };

  /**
   * Fetch All Financial Data
   */
  const loadFinanceData = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      clearAlerts();

      const [dashStats, incRes, expRes, catRes, txnRes, pnl, gst] = await Promise.all([
        financeService.getDashboardStats(businessId),
        financeService.listIncomes(businessId, { search: searchTerm, category: categoryFilter || undefined }),
        financeService.listExpenses(businessId, { search: searchTerm, category: categoryFilter || undefined, approvalStatus: statusFilter || undefined }),
        financeService.listExpenseCategories(businessId),
        financeService.listTransactions(businessId, { search: searchTerm }),
        financeService.getProfitLossReport(businessId),
        financeService.getGstReport(businessId)
      ]);

      setStats(dashStats);
      setIncomes(incRes.incomes || []);
      setExpenses(expRes.expenses || []);
      setCategories(catRes || []);
      setTransactions(txnRes.transactions || []);
      setPnlReport(pnl);
      setGstReport(gst);
    } catch (err: any) {
      console.error('Failed to load finance data:', err);
      setAlertError(err.response?.data?.message || 'Failed to retrieve financial metrics.');
    } finally {
      setLoading(false);
    }
  }, [businessId, searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  /**
   * Income Form Handlers
   */
  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      await financeService.createIncome(businessId, {
        ...incomeForm,
        amount: Number(incomeForm.amount),
        taxDeducted: Number(incomeForm.taxDeducted || 0)
      });
      setAlertSuccess('Income entry recorded successfully and added to revenue.');
      setShowIncomeModal(false);
      setIncomeForm({
        title: '',
        category: 'Product Sales',
        source: 'Direct Client',
        amount: 0,
        taxDeducted: 0,
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadFinanceData();
    } catch (err: any) {
      setAlertError(err.response?.data?.message || 'Failed to record income.');
    }
  };

  /**
   * Expense Form Handlers
   */
  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      await financeService.createExpense(businessId, {
        ...expenseForm,
        amount: Number(expenseForm.amount),
        taxAmount: Number(expenseForm.taxAmount || 0)
      });
      setAlertSuccess('Expense recorded and approved into ledger.');
      setShowExpenseModal(false);
      setExpenseForm({
        title: '',
        category: 'Operations',
        amount: 0,
        taxAmount: 0,
        vendor: '',
        vendorGstin: '',
        paymentMethod: 'BANK_TRANSFER',
        reference: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadFinanceData();
    } catch (err: any) {
      setAlertError(err.response?.data?.message || 'Failed to record expense.');
    }
  };

  const handleApproveExpense = async (expenseId: string) => {
    if (!businessId) return;
    try {
      await financeService.approveExpense(businessId, expenseId);
      setAlertSuccess('Expense approved and applied to accounts.');
      loadFinanceData();
    } catch (err: any) {
      setAlertError(err.response?.data?.message || 'Failed to approve expense.');
    }
  };

  const handleRejectExpense = async (expenseId: string) => {
    if (!businessId) return;
    const reason = window.prompt('Enter reason for expense rejection:');
    if (!reason) return;
    try {
      await financeService.rejectExpense(businessId, expenseId, reason);
      setAlertSuccess('Expense marked as rejected.');
      loadFinanceData();
    } catch (err: any) {
      setAlertError(err.response?.data?.message || 'Failed to reject expense.');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!businessId) return;
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await financeService.deleteExpense(businessId, expenseId);
      setAlertSuccess('Expense removed successfully.');
      loadFinanceData();
    } catch (err: any) {
      setAlertError(err.response?.data?.message || 'Failed to delete expense.');
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      await financeService.createExpenseCategory(businessId, {
        ...categoryForm,
        budgetLimit: Number(categoryForm.budgetLimit || 0)
      });
      setAlertSuccess('New expense category added.');
      setShowCategoryModal(false);
      setCategoryForm({ name: '', code: '', description: '', budgetLimit: 0 });
      loadFinanceData();
    } catch (err: any) {
      setAlertError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  // Export Table to CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No data available to export');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Finance & Accounts Hub
                {loading && <Clock className="w-4 h-4 animate-spin text-indigo-500" />}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Centralized Profit & Loss, Indian GST compliance, income streams, and corporate expense auditing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIncomeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            Record Income
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <ArrowDownRight className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {alertSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{alertSuccess}</span>
          </div>
          <button onClick={() => setAlertSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {alertError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>{alertError}</span>
          </div>
          <button onClick={() => setAlertError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Verified inflows
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{(stats?.totalExpenses || 0).toLocaleString()}</p>
            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              OpEx, Payroll & Purchases
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Profit</p>
            <p className={`text-2xl font-bold mt-1 ${(stats?.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{(stats?.netProfit || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Margin: {stats?.profitMarginPercent || 0}%
            </p>
          </div>
          <div className={`p-3 rounded-lg ${(stats?.netProfit || 0) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Collections</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">₹{(stats?.pendingPaymentsAmount || 0).toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">
              {stats?.overdueInvoicesCount || 0} overdue invoices
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Financial P&L Overview
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'income'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Income Streams ({incomes.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            Expense Management ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('gst')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'gst'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Indian GST Compliance
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Audit Ledger ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Financial Reports
          </button>
        </nav>
      </div>

      {/* Filter / Search Bar */}
      {(activeTab === 'income' || activeTab === 'expenses' || activeTab === 'transactions') && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by reference, title, or vendor...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {(activeTab === 'expenses' || activeTab === 'income') && categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            {activeTab === 'expenses' && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="">All Approval Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white hover:bg-slate-50 font-medium text-slate-700"
                >
                  Categories
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: FINANCIAL OVERVIEW & PROFIT & LOSS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* P&L Breakdown Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">Profit & Loss Statement (Fiscal Year)</h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                  Real Records
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="flex justify-between font-bold text-emerald-900">
                    <span>Operating Gross Revenue</span>
                    <span>₹{(pnlReport?.operatingRevenue.grossRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-emerald-700 mt-1 pl-2 space-y-0.5">
                    <div className="flex justify-between">
                      <span>• Client Sales Invoices (Taxable):</span>
                      <span>₹{(pnlReport?.operatingRevenue.salesInvoicesTotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Direct Income Streams:</span>
                      <span>₹{(pnlReport?.operatingRevenue.independentIncomeTotal || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-rose-50 rounded-lg">
                  <div className="flex justify-between font-bold text-rose-900">
                    <span>Total Operating Costs & Outflows</span>
                    <span>₹{(pnlReport?.costOfGoodsAndExpenses.totalExpenses || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-rose-700 mt-1 pl-2 space-y-0.5">
                    <div className="flex justify-between">
                      <span>• Operational Expenses (Approved):</span>
                      <span>₹{(pnlReport?.costOfGoodsAndExpenses.operatingExpenses || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Processed Workforce Payroll:</span>
                      <span>₹{(pnlReport?.costOfGoodsAndExpenses.payrollSalaries || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Inventory & Materials Procurement:</span>
                      <span>₹{(pnlReport?.costOfGoodsAndExpenses.inventoryPurchases || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-center text-lg font-bold">
                  <span>Net Bottom-Line Profit:</span>
                  <span className={(pnlReport?.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    ₹{(pnlReport?.netProfit || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoicing & Cash Collections Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">Cash Flow & Invoicing Summary</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Total Issued Invoices</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalInvoicesCount || 0}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-700 font-semibold uppercase">Fully Settled</p>
                  <p className="text-2xl font-bold text-emerald-800 mt-1">{stats?.paidInvoicesCount || 0}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
                  <p className="text-xs text-amber-700 font-semibold uppercase">Pending Invoices</p>
                  <p className="text-2xl font-bold text-amber-800 mt-1">₹{(stats?.pendingPaymentsAmount || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
                  <p className="text-xs text-indigo-700 font-semibold uppercase">Cash Inflows</p>
                  <p className="text-2xl font-bold text-indigo-800 mt-1">₹{(stats?.receivedPaymentsAmount || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INCOME STREAMS */}
      {/* ========================================================================= */}
      {activeTab === 'income' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Income #</th>
                  <th className="px-6 py-3.5">Title & Source</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Method & Ref</th>
                  <th className="px-6 py-3.5 text-right">Gross Amount</th>
                  <th className="px-6 py-3.5 text-right">Net Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {incomes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No income records logged yet.
                    </td>
                  </tr>
                ) : (
                  incomes.map((inc) => (
                    <tr key={inc._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-emerald-600 whitespace-nowrap">
                        {inc.incomeNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{inc.title}</div>
                        <div className="text-xs text-slate-400">{inc.source}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700">
                          {inc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        {new Date(inc.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <div className="text-slate-800 font-medium">{inc.paymentMethod}</div>
                        <div className="text-slate-400">{inc.referenceNumber || '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-medium text-slate-600">
                        ₹{inc.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-emerald-600">
                        ₹{inc.netAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EXPENSE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Expense #</th>
                  <th className="px-6 py-3.5">Title & Vendor</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Amount (₹)</th>
                  <th className="px-6 py-3.5">Approval</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No expense records logged.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-rose-600 whitespace-nowrap">
                        {exp.expenseNumber || 'EXP-LEGACY'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{exp.title}</div>
                        <div className="text-xs text-slate-400">
                          {exp.vendor ? `Vendor: ${exp.vendor}` : 'General Expense'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-slate-900">
                        ₹{(exp.totalAmount || exp.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            exp.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : exp.approvalStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {exp.approvalStatus || 'APPROVED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {exp.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveExpense(exp._id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Approve Expense"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectExpense(exp._id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                title="Reject Expense"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteExpense(exp._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete Expense"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INDIAN GST COMPLIANCE */}
      {/* ========================================================================= */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Taxable Turnover</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{(gstReport?.totalTaxableTurnover || 0).toLocaleString()}</p>
              <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Intra-State:</span>
                  <span>₹{(gstReport?.intraStateTurnover || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inter-State:</span>
                  <span>₹{(gstReport?.interStateTurnover || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Intra-State GST (CGST + SGST)</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                ₹{((gstReport?.taxSummary.cgstTotal || 0) + (gstReport?.taxSummary.sgstTotal || 0)).toLocaleString()}
              </p>
              <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>CGST (Central):</span>
                  <span>₹{(gstReport?.taxSummary.cgstTotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (State):</span>
                  <span>₹{(gstReport?.taxSummary.sgstTotal || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Inter-State GST (IGST)</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{(gstReport?.taxSummary.igstTotal || 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Total GST Liability: ₹{(gstReport?.taxSummary.totalGstCollected || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* HSN / SAC Summary Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">HSN / SAC Tax Compliance Breakdown</h3>
                <p className="text-xs text-slate-500 mt-0.5">Legally compliant GST classification for GSTR-1 preparation</p>
              </div>
              <button
                onClick={() => exportToCSV(gstReport?.hsnSummary || [], 'GST_HSN_Report')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase">
                  <tr>
                    <th className="px-4 py-2.5">HSN/SAC Code</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-right">Taxable Value</th>
                    <th className="px-4 py-2.5 text-center">Rate</th>
                    <th className="px-4 py-2.5 text-right">CGST</th>
                    <th className="px-4 py-2.5 text-right">SGST</th>
                    <th className="px-4 py-2.5 text-right">IGST</th>
                    <th className="px-4 py-2.5 text-right">Total Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {gstReport?.hsnSummary && gstReport.hsnSummary.length > 0 ? (
                    gstReport.hsnSummary.map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-indigo-600">{h.hsnSacCode}</td>
                        <td className="px-4 py-3">{h.description}</td>
                        <td className="px-4 py-3 text-right font-medium">₹{h.taxableValue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">{h.taxRate}%</td>
                        <td className="px-4 py-3 text-right">₹{h.cgstAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">₹{h.sgstAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">₹{h.igstAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">₹{h.totalTax.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        No invoices generated with GST breakdowns yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT TRANSACTIONS LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-6 py-3.5">TXN #</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Type & Reference</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5 text-right">Debit (Out)</th>
                  <th className="px-6 py-3.5 text-right">Credit (In)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No financial ledger transactions recorded.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-indigo-600 whitespace-nowrap">
                        {t.transactionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-xs text-slate-800">{t.type}</span>
                        <span className="block text-[11px] text-slate-400">{t.referenceId}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700">{t.description}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-medium text-rose-600">
                        {t.debit > 0 ? `₹${t.debit.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-emerald-600">
                        {t.credit > 0 ? `₹${t.credit.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: REPORTS & EXPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Financial Reports & Exports</h2>
              <p className="text-xs text-slate-500">Download formatted accounting and tax reports</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Print Current Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg space-y-3 bg-slate-50">
              <h4 className="font-bold text-slate-800 text-sm">Profit & Loss Summary</h4>
              <p className="text-xs text-slate-500">Complete income, COGS, and operational expenses audit.</p>
              <button
                onClick={() =>
                  exportToCSV(
                    [
                      { Metric: 'Gross Revenue', Amount: pnlReport?.operatingRevenue.grossRevenue },
                      { Metric: 'Sales Invoices', Amount: pnlReport?.operatingRevenue.salesInvoicesTotal },
                      { Metric: 'Direct Incomes', Amount: pnlReport?.operatingRevenue.independentIncomeTotal },
                      { Metric: 'Total Expenses', Amount: pnlReport?.costOfGoodsAndExpenses.totalExpenses },
                      { Metric: 'Net Profit', Amount: pnlReport?.netProfit }
                    ],
                    'Profit_Loss_Report'
                  )
                }
                className="w-full py-2 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"
              >
                Download P&L CSV
              </button>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg space-y-3 bg-slate-50">
              <h4 className="font-bold text-slate-800 text-sm">Income Stream Ledger</h4>
              <p className="text-xs text-slate-500">Chronological client payments and income sources.</p>
              <button
                onClick={() => exportToCSV(incomes, 'Income_Report')}
                className="w-full py-2 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
              >
                Download Incomes CSV
              </button>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg space-y-3 bg-slate-50">
              <h4 className="font-bold text-slate-800 text-sm">Expense Register</h4>
              <p className="text-xs text-slate-500">All vendor expenditures, categories and approval status.</p>
              <button
                onClick={() => exportToCSV(expenses, 'Expense_Report')}
                className="w-full py-2 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700"
              >
                Download Expenses CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD INCOME */}
      {/* ========================================================================= */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">Record Income Inflow</h3>
              <button onClick={() => setShowIncomeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIncome} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Income Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Client Retainer"
                  value={incomeForm.title}
                  onChange={(e) => setIncomeForm({ ...incomeForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={incomeForm.category}
                    onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Product Sales">Product Sales</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Service">Service</option>
                    <option value="Investment">Investment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source</label>
                  <input
                    type="text"
                    required
                    value={incomeForm.source}
                    onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">TDS / Tax Withheld (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={incomeForm.taxDeducted}
                    onChange={(e) => setIncomeForm({ ...incomeForm, taxDeducted: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={incomeForm.paymentMethod}
                    onChange={(e) => setIncomeForm({ ...incomeForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / UTR</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR12345678"
                    value={incomeForm.referenceNumber}
                    onChange={(e) => setIncomeForm({ ...incomeForm, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold"
                >
                  Confirm Inflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD EXPENSE */}
      {/* ========================================================================= */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">Record Business Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Hosting Bill"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="Operations">Operations</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Software">Software</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Web Services"
                    value={expenseForm.vendor}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={expenseForm.taxAmount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, taxAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CREDIT_CARD">Corporate Card</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference / Invoice #</label>
                  <input
                    type="text"
                    placeholder="e.g. AWS-2026-OCT"
                    value={expenseForm.reference}
                    onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD EXPENSE CATEGORY */}
      {/* ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">Add Expense Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. R&D Research"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EXP-RND"
                  value={categoryForm.code}
                  onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg text-sm uppercase"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboardPage;
