import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Building2,
  Users,
  DollarSign,
  Receipt,
  UserPlus,
  RefreshCw,
  ShoppingBag,
  Boxes,
  Briefcase,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Settings,
  ChevronDown,
  TrendingUp,
  Clock,
  X,
  Sparkles,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import businessService from '../../services/businessService';
import {
  IBusinessDashboardStats,
  IBusinessAnalytics,
  IBusinessProfileUpdate,
  IBusinessFullSettings,
  IAuditLogItem,
  IAddEmployeeInput,
  IAddCustomerInput,
  ICreateInvoiceInput,
  IAddProductInput,
  ICreatePurchaseOrderInput,
  ICreateProjectInput
} from '../../types';

type DateFilterPeriod = 'today' | '7d' | '30d' | 'this_month' | 'this_year' | 'custom';

export const BusinessOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { businesses, activeBusiness, switchBusiness, refreshBusinesses } = useBusiness();

  // Active Business ID
  const businessId = activeBusiness?.id || activeBusiness?._id || '60d0fe4f5311236168a109ca';

  // Loading & notification states
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Date Filter State
  const [period, setPeriod] = useState<DateFilterPeriod>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  // 1. Dashboard Statistics
  const [stats, setStats] = useState<IBusinessDashboardStats>({
    totalEmployees: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
    lowStockProducts: 0,
    activeProjects: 0,
    currency: activeBusiness?.currency || 'USD',
    dateRange: { period: '30d' }
  });

  // 2. Analytics Charts Data
  const [analytics, setAnalytics] = useState<IBusinessAnalytics>({
    monthlyRevenue: [],
    monthlyExpenses: [],
    profitAndLoss: [],
    salesPerformance: [],
    orderStatistics: { statusBreakdown: [], totalCount: 0 },
    employeeStatistics: { departmentDistribution: [], roleDistribution: [], totalCount: 0 }
  });

  // 3. Recent Activities Feed
  const [activities, setActivities] = useState<IAuditLogItem[]>([]);

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [quickActionModal, setQuickActionModal] = useState<
    'employee' | 'customer' | 'invoice' | 'product' | 'purchaseOrder' | 'project' | null
  >(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState<IBusinessProfileUpdate>({
    name: activeBusiness?.name || '',
    logo: activeBusiness?.logo || '',
    businessEmail: activeBusiness?.businessEmail || '',
    phone: activeBusiness?.phone || '',
    website: activeBusiness?.website || '',
    description: activeBusiness?.description || '',
    gstin: activeBusiness?.gstin || '',
    category: activeBusiness?.category || activeBusiness?.industry || ''
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<IBusinessFullSettings>({
    currency: activeBusiness?.currency || 'USD',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    invoiceSettings: {
      prefix: 'INV-',
      nextNumber: 1001,
      paymentTermsDays: 30,
      defaultNotes: 'Payment is due within 30 days of invoice date.'
    },
    notificationPreferences: {
      emailOnOrder: true,
      emailOnPayment: true,
      lowStockAlerts: true,
      weeklyDigest: true
    },
    workingHours: {
      start: '09:00',
      end: '18:00',
      workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  });

  // Quick Action Forms
  const [employeeForm, setEmployeeForm] = useState<IAddEmployeeInput>({
    name: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    department: 'Engineering & IT'
  });

  const [customerForm, setCustomerForm] = useState<IAddCustomerInput>({
    name: '',
    email: '',
    phone: '',
    companyName: ''
  });

  const [invoiceForm, setInvoiceForm] = useState<ICreateInvoiceInput>({
    customerName: '',
    customerEmail: '',
    amount: 1500,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Standard service engagement contract.'
  });

  const [productForm, setProductForm] = useState<IAddProductInput>({
    name: '',
    sku: '',
    category: 'Hardware',
    price: 499,
    cost: 250,
    stockQuantity: 15,
    reorderPoint: 5,
    unit: 'units'
  });

  const [poForm, setPoForm] = useState<ICreatePurchaseOrderInput>({
    title: '',
    vendor: '',
    category: 'Operations',
    amount: 2500,
    paymentMethod: 'Bank Wire',
    reference: ''
  });

  const [projectForm, setProjectForm] = useState<ICreateProjectInput>({
    name: '',
    client: '',
    budget: 35000,
    startDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const notifyError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 6000);
  };

  // Primary Data Fetcher for the active business
  const loadDashboardData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const filter = {
        period,
        startDate: period === 'custom' ? customStartDate : undefined,
        endDate: period === 'custom' ? customEndDate : undefined
      };

      const [statsRes, analyticsRes, activitiesRes] = await Promise.all([
        businessService.getDashboardStats(businessId, filter),
        businessService.getAnalytics(businessId, filter),
        businessService.getRecentActivities(businessId, 10)
      ]);

      setStats(statsRes);
      setAnalytics(analyticsRes);
      setActivities(activitiesRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch executive dashboard metrics.';
      notifyError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [businessId, period, customStartDate, customEndDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Synchronize profile form when active business changes
  useEffect(() => {
    if (activeBusiness) {
      setProfileForm({
        name: activeBusiness.name || '',
        logo: activeBusiness.logo || '',
        businessEmail: activeBusiness.businessEmail || activeBusiness.contactEmail || '',
        phone: activeBusiness.phone || '',
        website: activeBusiness.website || '',
        description: activeBusiness.description || '',
        gstin: activeBusiness.gstin || '',
        category: activeBusiness.category || activeBusiness.industry || ''
      });
      setSettingsForm((prev) => ({
        ...prev,
        currency: activeBusiness.currency || 'USD'
      }));
    }
  }, [activeBusiness]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (refreshBusinesses) await refreshBusinesses();
    notifySuccess('Dashboard synchronized with live MongoDB records.');
  };

  const handleApplyCustomDate = (e: FormEvent) => {
    e.preventDefault();
    if (!customStartDate || !customEndDate) {
      notifyError('Please specify both start date and end date.');
      return;
    }
    setPeriod('custom');
    setShowCustomPicker(false);
  };

  // Quick Action Submissions
  const handleAddEmployee = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await businessService.addEmployee(businessId, employeeForm);
      notifySuccess(`Employee ${employeeForm.name} added successfully.`);
      setQuickActionModal(null);
      setEmployeeForm({ name: '', email: '', phone: '', role: 'EMPLOYEE', department: 'Engineering & IT' });
      await loadDashboardData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to add employee');
    }
  };

  const handleAddCustomer = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await businessService.addCustomer(businessId, customerForm);
      notifySuccess(`Customer ${customerForm.name} registered successfully.`);
      setQuickActionModal(null);
      setCustomerForm({ name: '', email: '', phone: '', companyName: '' });
      await loadDashboardData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to add customer');
    }
  };

  const handleCreateInvoice = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await businessService.createInvoice(businessId, invoiceForm);
      notifySuccess(`Invoice generated for ${invoiceForm.customerName}.`);
      setQuickActionModal(null);
      setInvoiceForm({
        customerName: '',
        customerEmail: '',
        amount: 1500,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Standard contract billing.'
      });
      await loadDashboardData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await businessService.addProduct(businessId, productForm);
      notifySuccess(`Product ${productForm.name} added to inventory catalog.`);
      setQuickActionModal(null);
      setProductForm({ name: '', sku: '', category: 'Hardware', price: 499, cost: 250, stockQuantity: 15, reorderPoint: 5, unit: 'units' });
      await loadDashboardData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to add product');
    }
  };

  const handleCreatePurchaseOrder = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await businessService.createPurchaseOrder(businessId, poForm);
      notifySuccess(`Purchase order for ${poForm.vendor} recorded.`);
      setQuickActionModal(null);
      setPoForm({ title: '', vendor: '', category: 'Operations', amount: 2500, paymentMethod: 'Bank Wire', reference: '' });
      await loadDashboardData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to record purchase order');
    }
  };

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await businessService.createProject(businessId, projectForm);
      notifySuccess(`Project ${projectForm.name} initiated.`);
      setQuickActionModal(null);
      setProjectForm({ name: '', client: '', budget: 35000, startDate: new Date().toISOString().split('T')[0], description: '' });
      await loadDashboardData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await businessService.updateBusinessProfile(businessId, profileForm);
      notifySuccess('Business profile updated successfully.');
      setProfileModalOpen(false);
      if (refreshBusinesses) await refreshBusinesses();
      await loadDashboardData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await businessService.updateBusinessSettings(businessId, settingsForm);
      notifySuccess('Business operational settings updated.');
      setSettingsModalOpen(false);
      await loadDashboardData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  // Check if current business is completely empty (no customers, no orders, no sales)
  const isBusinessEmpty =
    !loading &&
    stats.totalOrders === 0 &&
    stats.totalCustomers === 0 &&
    stats.totalRevenue === 0 &&
    stats.totalEmployees <= 1;

  // Colors for order statistics chart
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP EXECUTIVE BANNER & BUSINESS SWITCHER */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md font-bold text-lg shrink-0">
            {activeBusiness?.logo ? (
              <img src={activeBusiness.logo} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              activeBusiness?.name?.substring(0, 2).toUpperCase() || 'NX'
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                {activeBusiness?.name || 'Nexus Technologies Inc.'}
              </h1>

              {/* Status Badge */}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {(activeBusiness?.status || 'ACTIVE').toUpperCase()}
              </span>

              {/* Plan Badge */}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {activeBusiness?.plan || 'Enterprise Tier'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1">
              Owner: <span className="font-semibold text-white">{user?.name}</span> ({user?.email}) • Currency: <span className="font-mono text-emerald-400 font-bold">{stats.currency}</span>
            </p>
          </div>
        </div>

        {/* Business Switcher & Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Multi-Business Switcher */}
          {businesses.length > 1 && (
            <div className="relative">
              <select
                aria-label="Switch Active Business"
                value={activeBusiness?.id || activeBusiness?._id}
                onChange={(e) => switchBusiness(e.target.value)}
                className="bg-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 border border-slate-700 outline-none cursor-pointer appearance-none pr-8 hover:bg-slate-700/80 transition-colors"
              >
                {businesses.map((b) => (
                  <option key={b.id || b._id} value={b.id || b._id}>
                    Switch: {b.name} ({b.currency || 'USD'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
            iconLeft={RefreshCw}
          >
            Sync
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setProfileModalOpen(true)}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
            iconLeft={Building2}
          >
            Profile
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSettingsModalOpen(true)}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
            iconLeft={Settings}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Alert Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DATE FILTER CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Timeline Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'this_year', label: 'This Year' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPeriod(item.id as DateFilterPeriod);
                setShowCustomPicker(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === item.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              period === 'custom'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Expandable Drawer */}
      {showCustomPicker && (
        <form
          onSubmit={handleApplyCustomDate}
          className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-3 animate-fadeIn text-xs"
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-semibold text-slate-600">From:</span>
            <input
              type="date"
              required
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-semibold text-slate-600">To:</span>
            <input
              type="date"
              required
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500"
            />
          </div>
          <Button variant="primary" size="sm" type="submit">
            Apply Date Range
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={() => setShowCustomPicker(false)}>
            Cancel
          </Button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. 10 REAL DASHBOARD STATISTICS CARDS (FROM ACTUAL MONGODB RECORDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Employees */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Employees</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.totalEmployees}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Staff & Managers</p>
        </Card>

        {/* 2. Total Customers */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.totalCustomers}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Accounts on file</p>
        </Card>

        {/* 3. Total Sales */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            ${stats.totalSales.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Volume executed</p>
        </Card>

        {/* 4. Total Orders */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.totalOrders}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Processed orders</p>
        </Card>

        {/* 5. Total Revenue */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Settled income</p>
        </Card>

        {/* 6. Total Expenses */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Expenses</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-600">
            ${stats.totalExpenses.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Operating costs</p>
        </Card>

        {/* 7. Net Profit */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors bg-gradient-to-br from-white to-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Profit</span>
            <div className={`p-1.5 rounded-lg ${stats.netProfit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`mt-2 text-2xl font-extrabold ${stats.netProfit >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
            ${stats.netProfit.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Revenue − Expenses</p>
        </Card>

        {/* 8. Pending Payments */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Payments</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-700">
            ${stats.pendingPayments.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Outstanding invoices</p>
        </Card>

        {/* 9. Low Stock Products */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Low Stock Products</span>
            <div className={`p-1.5 rounded-lg ${stats.lowStockProducts > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.lowStockProducts}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">≤ Reorder threshold</p>
        </Card>

        {/* 10. Active Projects */}
        <Card className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Projects</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.activeProjects}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Initiatives in flight</p>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 4. QUICK ACTIONS SHORTCUT BAR */}
      {/* ========================================================================= */}
      <Card className="p-5 border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Executive Quick Actions
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Instantly generate records with audit trail</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <button
            onClick={() => setQuickActionModal('employee')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Add Employee</span>
          </button>

          <button
            onClick={() => setQuickActionModal('customer')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Add Customer</span>
          </button>

          <button
            onClick={() => setQuickActionModal('invoice')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Create Invoice</span>
          </button>

          <button
            onClick={() => setQuickActionModal('product')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <Boxes className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Add Product</span>
          </button>

          <button
            onClick={() => setQuickActionModal('purchaseOrder')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Purchase Order</span>
          </button>

          <button
            onClick={() => setQuickActionModal('project')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/30 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Create Project</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('analytics-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-100 transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">View Reports</span>
          </button>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 5. EMPTY STATE (IF NO RECORDS EXIST FOR THIS BUSINESS) */}
      {/* ========================================================================= */}
      {isBusinessEmpty && (
        <Card className="p-8 sm:p-12 border-slate-200 text-center bg-slate-50/50">
          <div className="w-14 h-14 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Your Business Hub is Fresh & Ready</h3>
          <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No orders or invoices have been recorded yet for {activeBusiness?.name}. Get started by creating your first client account, issuing an invoice, or registering an employee.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setQuickActionModal('customer')}
              iconLeft={Briefcase}
            >
              Add First Customer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickActionModal('invoice')}
              iconLeft={Receipt}
            >
              Generate First Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickActionModal('product')}
              iconLeft={Boxes}
            >
              Add Product to Catalog
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 6. ANALYTICS CHARTS (6 INTERACTIVE RECHARTS) */}
      {/* ========================================================================= */}
      <div id="analytics-section" className="space-y-6 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Executive Analytics & Financial Performance
            </h2>
            <p className="text-xs text-slate-500">Live MongoDB aggregations across revenue, expenses, profit/loss, and workforce</p>
          </div>
        </div>

        {/* Row 1: Monthly Revenue & Monthly Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Monthly Revenue */}
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">1. Monthly Revenue Trend</h3>
                <span className="text-[11px] text-slate-400">Settled invoice income vs target</span>
              </div>
              <Badge variant="success" size="xs">Live DB</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyRevenue}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" name="Revenue ($)" />
                  <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="4 4" name="Target ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Monthly Expenses */}
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">2. Monthly Expenses</h3>
                <span className="text-[11px] text-slate-400">Operational costs & payroll disbursements</span>
              </div>
              <Badge variant="danger" size="xs">Costs</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Expenses']} />
                  <Legend />
                  <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Row 2: Profit & Loss + Sales Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: Profit & Loss */}
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">3. Profit & Loss Overview</h3>
                <span className="text-[11px] text-slate-400">Revenue vs Expense comparison & Net Margin</span>
              </div>
              <Badge variant="primary" size="xs">P&L</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.profitAndLoss}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#94a3b8" name="Expenses" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" fill="#10b981" name="Net Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 4: Sales Performance */}
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">4. Sales Performance</h3>
                <span className="text-[11px] text-slate-400">Order count & average transaction value (AOV)</span>
              </div>
              <Badge variant="primary" size="xs">Performance</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.salesPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="salesCount" stroke="#8b5cf6" strokeWidth={2} name="Order Count" />
                  <Line yAxisId="right" type="monotone" dataKey="averageOrderValue" stroke="#f59e0b" strokeWidth={2} name="Avg Order Value ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Row 3: Order Statistics (Distribution) + Employee Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 5: Order Statistics */}
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">5. Order Statistics by Status</h3>
                <span className="text-[11px] text-slate-400">
                  Total {analytics.orderStatistics.totalCount} orders across distribution pipeline
                </span>
              </div>
              <Badge size="xs">Fulfillment</Badge>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              {analytics.orderStatistics.totalCount === 0 ? (
                <div className="text-center text-slate-400 text-xs">No orders recorded for this timeline.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.orderStatistics.statusBreakdown.filter((s) => s.count > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {analytics.orderStatistics.statusBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: any) => [`${value} orders`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Chart 6: Employee Statistics */}
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">6. Employee & Workforce Distribution</h3>
                <span className="text-[11px] text-slate-400">Department allocation & team size</span>
              </div>
              <Badge size="xs">HR</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.employeeStatistics.departmentDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(value: any) => [`${value} members`, 'Headcount']} />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Headcount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. RECENT ACTIVITIES FEED (FROM MONGODB ACTIVITYLOG) */}
      {/* ========================================================================= */}
      <Card className="p-6 border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Recent Business Operations Activity</h3>
          </div>
          <span className="text-xs text-slate-400">Real audit log stream</span>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent activities recorded for this business entity.
            </div>
          ) : (
            activities.map((act) => (
              <div key={act._id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-600 font-bold">
                    {act.module === 'workforce' && <Users className="w-4 h-4 text-blue-600" />}
                    {act.module === 'crm' && <Briefcase className="w-4 h-4 text-indigo-600" />}
                    {act.module === 'billing' && <Receipt className="w-4 h-4 text-emerald-600" />}
                    {act.module === 'inventory' && <Boxes className="w-4 h-4 text-purple-600" />}
                    {act.module === 'finance' && <DollarSign className="w-4 h-4 text-amber-600" />}
                    {act.module === 'projects' && <FolderKanban className="w-4 h-4 text-rose-600" />}
                    {act.module !== 'workforce' &&
                      act.module !== 'crm' &&
                      act.module !== 'billing' &&
                      act.module !== 'inventory' &&
                      act.module !== 'finance' &&
                      act.module !== 'projects' && <Building2 className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{act.description}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="uppercase font-bold tracking-wider text-[10px] text-blue-600">{act.module}</span>
                      <span>•</span>
                      <span>By {typeof act.userId === 'object' && act.userId !== null ? act.userId.name : 'System'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 shrink-0 font-mono">
                  {new Date(act.timestamp || act.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: BUSINESS PROFILE MANAGEMENT */}
      {/* ========================================================================= */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Manage Business Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Business Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Logo URL</label>
                <input
                  type="url"
                  value={profileForm.logo || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, logo: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Official Email</label>
                <input
                  type="email"
                  value={profileForm.businessEmail || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, businessEmail: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Website</label>
                <input
                  type="url"
                  value={profileForm.website || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">GSTIN / Tax ID</label>
                <input
                  type="text"
                  value={profileForm.gstin || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Category</label>
                <input
                  type="text"
                  value={profileForm.category || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={profileForm.description || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setProfileModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BUSINESS SETTINGS MANAGEMENT */}
      {/* ========================================================================= */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Manage Business Operational Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Operating Currency</label>
                  <select
                    value={settingsForm.currency}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:border-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Time Zone</label>
                  <input
                    type="text"
                    value={settingsForm.timezone || 'UTC'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Date Format</label>
                  <select
                    value={settingsForm.dateFormat || 'YYYY-MM-DD'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:border-blue-500"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>

              {/* Invoice settings */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Invoice Defaults
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5">Prefix</label>
                    <input
                      type="text"
                      value={settingsForm.invoiceSettings?.prefix || 'INV-'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          invoiceSettings: {
                            ...settingsForm.invoiceSettings!,
                            prefix: e.target.value
                          }
                        })
                      }
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5">Payment Terms (Days)</label>
                    <input
                      type="number"
                      value={settingsForm.invoiceSettings?.paymentTermsDays || 30}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          invoiceSettings: {
                            ...settingsForm.invoiceSettings!,
                            paymentTermsDays: Number(e.target.value)
                          }
                        })
                      }
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Working Hours & Business Schedule
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5">Start Time</label>
                    <input
                      type="time"
                      value={settingsForm.workingHours?.start || '09:00'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          workingHours: {
                            ...settingsForm.workingHours!,
                            start: e.target.value
                          }
                        })
                      }
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5">End Time</label>
                    <input
                      type="time"
                      value={settingsForm.workingHours?.end || '18:00'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          workingHours: {
                            ...settingsForm.workingHours!,
                            end: e.target.value
                          }
                        })
                      }
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setSettingsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Settings
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK ACTION MODALS (CREATE REAL DB RECORDS) */}
      {/* ========================================================================= */}

      {/* Quick Action: Add Employee */}
      {quickActionModal === 'employee' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddEmployee}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Team Member</h3>
              <button type="button" onClick={() => setQuickActionModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="font-semibold block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="Marcus Thorne"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="m.thorne@company.com"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Role Assignment</label>
              <select
                value={employeeForm.role}
                onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg bg-white outline-none"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setQuickActionModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create Employee Record
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Action: Add Customer */}
      {quickActionModal === 'customer' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCustomer}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Customer</h3>
              <button type="button" onClick={() => setQuickActionModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="font-semibold block mb-1">Customer / Contact Name</label>
              <input
                type="text"
                required
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="Eleanor Vance"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Company / Organization</label>
              <input
                type="text"
                value={customerForm.companyName || ''}
                onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="Apex Cloud Corp"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="billing@apexcloud.com"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setQuickActionModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Register Customer
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Action: Create Invoice */}
      {quickActionModal === 'invoice' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateInvoice}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Create New Invoice</h3>
              <button type="button" onClick={() => setQuickActionModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="font-semibold block mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={invoiceForm.customerName}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="Acme Cloud Dynamics"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Customer Email</label>
              <input
                type="email"
                required
                value={invoiceForm.customerEmail}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="procure@acmecloud.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Amount ($)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setQuickActionModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Issue Invoice
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Action: Add Product */}
      {quickActionModal === 'product' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddProduct}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Inventory Product</h3>
              <button type="button" onClick={() => setQuickActionModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="font-semibold block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="Enterprise Optical Switch"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">SKU Code</label>
                <input
                  type="text"
                  required
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                  placeholder="SW-OPT-48"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <input
                  type="text"
                  value={productForm.category || ''}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Price ($)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Initial Stock</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setQuickActionModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save to Inventory
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Action: Purchase Order */}
      {quickActionModal === 'purchaseOrder' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePurchaseOrder}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Create Purchase Order</h3>
              <button type="button" onClick={() => setQuickActionModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="font-semibold block mb-1">PO Title / Item</label>
              <input
                type="text"
                required
                value={poForm.title}
                onChange={(e) => setPoForm({ ...poForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="High-Compute Server Hardware"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Vendor / Supplier</label>
              <input
                type="text"
                required
                value={poForm.vendor}
                onChange={(e) => setPoForm({ ...poForm, vendor: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="Equinix Hardware Supplies"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Amount ($)</label>
              <input
                type="number"
                required
                min={1}
                value={poForm.amount}
                onChange={(e) => setPoForm({ ...poForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setQuickActionModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Record PO
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Action: Create Project */}
      {quickActionModal === 'project' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProject}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Initiate New Project</h3>
              <button type="button" onClick={() => setQuickActionModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="font-semibold block mb-1">Project Name</label>
              <input
                type="text"
                required
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="Cloud Infrastructure Expansion"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Client / Stakeholder</label>
              <input
                type="text"
                value={projectForm.client || ''}
                onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
                placeholder="Horizon Logistics"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Budget Allocation ($)</label>
              <input
                type="number"
                required
                min={0}
                value={projectForm.budget}
                onChange={(e) => setProjectForm({ ...projectForm, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setQuickActionModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Initiate Project
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BusinessOwnerDashboard;
