import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  Server,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  Eye,
  Settings,
  History,
  DollarSign,
  Lock,
  Mail,
  Check,
  X,
  Sliders,
  AlertCircle
} from 'lucide-react';
import adminService from '../../services/adminService';
import {
  IPlatformStats,
  IBusiness,
  ISubscriptionPlan,
  IAdminUserItem,
  IAuditLogItem,
  IPlatformSettings,
  IPaymentGatewayIntentResult
} from '../../types';

type DashboardTab = 'overview' | 'businesses' | 'subscriptions' | 'users' | 'audit' | 'settings';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Active top-level Tab
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Loading & notification states
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Overview Statistics
  const [stats, setStats] = useState<IPlatformStats>({
    totalBusinesses: 0,
    activeBusinesses: 0,
    pendingBusinesses: 0,
    suspendedBusinesses: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    recordedPlatformRevenue: 0,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  });

  // 2. Businesses State
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [businessSearch, setBusinessSearch] = useState<string>('');
  const [businessStatusFilter, setBusinessStatusFilter] = useState<string>('ALL');
  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState<boolean>(false);
  const [actionReasonModalOpen, setActionReasonModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'REJECT' | 'SUSPEND' | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  const [editBusinessModalOpen, setEditBusinessModalOpen] = useState<boolean>(false);
  const [editBusinessData, setEditBusinessData] = useState<Partial<IBusiness>>({});

  // 3. Subscription Management State
  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [editPlanModalOpen, setEditPlanModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<ISubscriptionPlan | null>(null);
  const [paymentGatewayModalOpen, setPaymentGatewayModalOpen] = useState<boolean>(false);
  const [gatewayIntentResult, setGatewayIntentResult] = useState<IPaymentGatewayIntentResult | null>(null);
  const [gatewayForm, setGatewayForm] = useState({
    businessId: '',
    planCode: 'PROFESSIONAL',
    billingCycle: 'monthly' as 'monthly' | 'annual',
    provider: 'stripe' as 'stripe' | 'razorpay'
  });

  // 4. User Management State
  const [usersList, setUsersList] = useState<IAdminUserItem[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<IAdminUserItem | null>(null);
  const [viewUserModalOpen, setViewUserModalOpen] = useState<boolean>(false);

  // 5. Audit Logs State
  const [auditLogs, setAuditLogs] = useState<IAuditLogItem[]>([]);
  const [auditModuleFilter, setAuditModuleFilter] = useState<string>('ALL');

  // 6. Admin Settings State
  const [settings, setSettings] = useState<IPlatformSettings | null>(null);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Show transient notification
  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const notifyError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 6000);
  };

  // Primary Data Fetcher
  const loadPlatformData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load Stats
      const statRes = await adminService.getOverviewStats();
      setStats(statRes);

      // 2. Load Businesses
      const bizRes = await adminService.getBusinesses({ limit: 50 });
      setBusinesses(bizRes.items);

      // 3. Load Plans & Subscriptions
      const planRes = await adminService.getSubscriptionPlans();
      setPlans(planRes);
      const subRes = await adminService.getSubscriptions({ limit: 30 });
      setSubscriptionsList(subRes.items);

      // 4. Load Users
      const userRes = await adminService.getUsers({ limit: 50 });
      setUsersList(userRes.items);

      // 5. Load Audit Logs
      const logsRes = await adminService.getAuditLogs({ limit: 40 });
      setAuditLogs(logsRes.items);

      // 6. Load Settings
      const settingsRes = await adminService.getPlatformSettings();
      setSettings(settingsRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load Super Admin cluster data.';
      notifyError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPlatformData();
  }, [loadPlatformData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlatformData();
    notifySuccess('Platform metrics & cluster data synchronized with MongoDB.');
  };

  // ==========================================
  // BUSINESS MANAGEMENT HANDLERS
  // ==========================================
  const handleApproveBusiness = async (biz: IBusiness) => {
    const bizId = biz.id || biz._id;
    if (!bizId) return;
    try {
      await adminService.approveBusiness(bizId);
      notifySuccess(`Business "${biz.name}" approved successfully and activated.`);
      await loadPlatformData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  const openActionModal = (biz: IBusiness, type: 'REJECT' | 'SUSPEND') => {
    setSelectedBusiness(biz);
    setActionType(type);
    setActionReason('');
    setActionReasonModalOpen(true);
  };

  const handleConfirmActionWithReason = async () => {
    if (!selectedBusiness || !actionType) return;
    const bizId = selectedBusiness.id || selectedBusiness._id;
    if (!bizId) return;

    if (!actionReason.trim()) {
      notifyError(`Please enter a valid reason to ${actionType.toLowerCase()} this business.`);
      return;
    }

    try {
      if (actionType === 'REJECT') {
        await adminService.rejectBusiness(bizId, actionReason.trim());
        notifySuccess(`Business "${selectedBusiness.name}" application rejected.`);
      } else {
        await adminService.suspendBusiness(bizId, actionReason.trim());
        notifySuccess(`Business "${selectedBusiness.name}" suspended.`);
      }
      setActionReasonModalOpen(false);
      await loadPlatformData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleReactivateBusiness = async (biz: IBusiness) => {
    const bizId = biz.id || biz._id;
    if (!bizId) return;
    try {
      await adminService.reactivateBusiness(bizId);
      notifySuccess(`Business "${biz.name}" reactivated.`);
      await loadPlatformData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Reactivation failed');
    }
  };

  const openEditBusinessModal = (biz: IBusiness) => {
    setSelectedBusiness(biz);
    setEditBusinessData({
      name: biz.name,
      category: biz.category || biz.industry,
      phone: biz.phone,
      businessEmail: biz.businessEmail || biz.contactEmail,
      website: biz.website,
      description: biz.description
    });
    setEditBusinessModalOpen(true);
  };

  const handleSaveBusinessEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    const bizId = selectedBusiness.id || selectedBusiness._id;
    if (!bizId) return;

    try {
      await adminService.editBusiness(bizId, editBusinessData);
      notifySuccess(`Business "${selectedBusiness.name}" updated successfully.`);
      setEditBusinessModalOpen(false);
      await loadPlatformData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to update business');
    }
  };

  // Filtered Businesses
  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
      (b.businessEmail && b.businessEmail.toLowerCase().includes(businessSearch.toLowerCase())) ||
      (b.ownerName && b.ownerName.toLowerCase().includes(businessSearch.toLowerCase()));
    const matchesStatus =
      businessStatusFilter === 'ALL' ||
      (b.status && b.status.toUpperCase() === businessStatusFilter.toUpperCase());
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // SUBSCRIPTION MANAGEMENT HANDLERS
  // ==========================================
  const openEditPlanModal = (plan: ISubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setEditPlanModalOpen(true);
  };

  const handleSavePlanEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const planId = editingPlan._id || editingPlan.id;
    if (!planId) return;

    try {
      await adminService.updateSubscriptionPlan(planId, {
        name: editingPlan.name,
        description: editingPlan.description,
        monthlyPrice: Number(editingPlan.monthlyPrice),
        yearlyPrice: Number(editingPlan.yearlyPrice),
        employeeLimit: Number(editingPlan.employeeLimit),
        storageLimitGb: Number(editingPlan.storageLimitGb)
      });
      notifySuccess(`Plan "${editingPlan.name}" updated successfully.`);
      setEditPlanModalOpen(false);
      await loadPlatformData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to update plan');
    }
  };

  const handleCreatePaymentIntent = async (e: FormEvent) => {
    e.preventDefault();
    if (!gatewayForm.businessId) {
      notifyError('Please select a target business organization.');
      return;
    }

    try {
      const result = await adminService.createPaymentGatewayIntent({
        businessId: gatewayForm.businessId,
        planCode: gatewayForm.planCode,
        billingCycle: gatewayForm.billingCycle,
        provider: gatewayForm.provider
      });
      setGatewayIntentResult(result);
      notifySuccess(`Cryptographic payment intent created for ${gatewayForm.provider.toUpperCase()}.`);
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Payment intent generation failed');
    }
  };

  // ==========================================
  // USER MANAGEMENT HANDLERS
  // ==========================================
  const handleToggleUserStatus = async (item: IAdminUserItem) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await adminService.updateUserStatus(item._id, newStatus);
      notifySuccess(`User ${item.name} status updated to ${newStatus}.`);
      await loadPlatformData();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // ==========================================
  // AUDIT LOGS HANDLERS
  // ==========================================
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditModuleFilter === 'ALL') return true;
    return log.module?.toLowerCase() === auditModuleFilter.toLowerCase();
  });

  // ==========================================
  // SETTINGS HANDLER
  // ==========================================
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const updated = await adminService.updatePlatformSettings(settings);
      setSettings(updated);
      setSettingsSaved(true);
      notifySuccess('Platform configuration saved successfully.');
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  if (loading && businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Synchronizing with MongoDB cluster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome / Super Admin Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Super Administrator Control Center</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Platform Root
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Logged in as <span className="font-semibold text-white">{user?.name}</span> ({user?.email}) • Centralized platform governance & multi-tenant isolation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
            iconLeft={RefreshCw}
          >
            Sync MongoDB Stats
          </Button>
          <Button
            variant="primary"
            size="sm"
            to="/register-business"
            iconLeft={Building2}
          >
            Register Business
          </Button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          Platform Overview
        </button>

        <button
          onClick={() => setActiveTab('businesses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'businesses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Business Management
          {stats.pendingBusinesses > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold ml-1">
              {stats.pendingBusinesses}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'subscriptions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Subscription Plans & Gateway
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Audit Logs
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Admin Settings
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW STATISTICS (ALL 8 DATABASE STATS FROM MONGODB) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 8 MongoDB Database Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Businesses */}
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Businesses</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.totalBusinesses}</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center">
                  Live MongoDB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Multi-tenant registered entities</p>
            </Card>

            {/* 2. Active Businesses */}
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Businesses</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.activeBusinesses}</span>
                <Badge variant="success" size="xs">Operational</Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Approved & fully enabled tenants</p>
            </Card>

            {/* 3. Pending Businesses */}
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Businesses</span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.pendingBusinesses}</span>
                {stats.pendingBusinesses > 0 ? (
                  <Badge variant="warning" size="xs">Action Needed</Badge>
                ) : (
                  <span className="text-xs text-slate-400">Queue clear</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting Super Admin review</p>
            </Card>

            {/* 4. Suspended Businesses */}
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suspended Businesses</span>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.suspendedBusinesses}</span>
                <Badge variant="danger" size="xs">Locked</Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Paused due to policy or billing</p>
            </Card>

            {/* 5. Total Users */}
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.totalUsers}</span>
                <span className="text-xs font-medium text-slate-500">Across 5 Roles</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">SuperAdmin, Owners, Managers, Staff, Clients</p>
            </Card>

            {/* 6. Active Subscriptions */}
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Subscriptions</span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.activeSubscriptions}</span>
                <Badge variant="primary" size="xs">Provisioned</Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Free, Starter, Pro, Enterprise</p>
            </Card>

            {/* 7. Expired Subscriptions */}
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expired Subscriptions</span>
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                  <ClockIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.expiredSubscriptions}</span>
                <span className="text-xs text-slate-400">Past renewal</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Renewal required for full quota</p>
            </Card>

            {/* 8. Recorded Platform Revenue */}
            <Card className="p-5 border-slate-200 bg-gradient-to-br from-white to-blue-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recorded Revenue</span>
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  ${stats.recordedPlatformRevenue.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-600">{stats.currency}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Authentic ledger transactions</p>
            </Card>
          </div>

          {/* Quick Action Bar & Pending Review Callout */}
          {stats.pendingBusinesses > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    {stats.pendingBusinesses} Business Application{stats.pendingBusinesses > 1 ? 's' : ''} Awaiting Approval
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Newly registered business organizations must be verified by the Super Administrator before tenant accounts are activated.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setBusinessStatusFilter('PENDING');
                  setActiveTab('businesses');
                }}
                className="bg-amber-600 hover:bg-amber-700 border-none shrink-0"
              >
                Review Applications
              </Button>
            </div>
          )}

          {/* Platform Health & Cluster Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-slate-200 lg:col-span-2">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Platform Tenant Distribution</h3>
                  <p className="text-xs text-slate-500">Breakdown of organizations managed in MongoDB</p>
                </div>
                <Badge variant="primary">Cluster Active</Badge>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Active Tenants</span>
                    <span className="text-slate-900">
                      {stats.totalBusinesses ? Math.round((stats.activeBusinesses / stats.totalBusinesses) * 100) : 0}% ({stats.activeBusinesses})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{
                        width: `${stats.totalBusinesses ? (stats.activeBusinesses / stats.totalBusinesses) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Pending Review</span>
                    <span className="text-amber-600">
                      {stats.totalBusinesses ? Math.round((stats.pendingBusinesses / stats.totalBusinesses) * 100) : 0}% ({stats.pendingBusinesses})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{
                        width: `${stats.totalBusinesses ? (stats.pendingBusinesses / stats.totalBusinesses) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Suspended / Inactive</span>
                    <span className="text-rose-600">
                      {stats.totalBusinesses ? Math.round((stats.suspendedBusinesses / stats.totalBusinesses) * 100) : 0}% ({stats.suspendedBusinesses})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all"
                      style={{
                        width: `${stats.totalBusinesses ? (stats.suspendedBusinesses / stats.totalBusinesses) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[11px] font-semibold text-slate-500">Gateway Intent</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Stripe + Razorpay</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[11px] font-semibold text-slate-500">Tenant Isolation</div>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5">Enforced RBAC</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[11px] font-semibold text-slate-500">Last Synced</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions Panel */}
            <Card className="p-6 border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Governance Quick Actions
              </h3>
              <div className="space-y-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab('businesses');
                    setBusinessStatusFilter('PENDING');
                  }}
                  className="w-full justify-start text-xs"
                  iconLeft={Building2}
                >
                  Inspect Pending Businesses ({stats.pendingBusinesses})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('subscriptions')}
                  className="w-full justify-start text-xs"
                  iconLeft={CreditCard}
                >
                  Configure 4 Subscription Plans
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentGatewayModalOpen(true)}
                  className="w-full justify-start text-xs"
                  iconLeft={DollarSign}
                >
                  Test Payment Gateway Intent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('users')}
                  className="w-full justify-start text-xs"
                  iconLeft={Users}
                >
                  Manage User Accounts ({stats.totalUsers})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('audit')}
                  className="w-full justify-start text-xs"
                  iconLeft={History}
                >
                  View System Audit Trail
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUSINESS MANAGEMENT (12 FIELDS, SEARCH, FILTER, APPROVE/REJECT/SUSPEND) */}
      {/* ========================================================================= */}
      {activeTab === 'businesses' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search businesses by name, email, owner..."
                  value={businessSearch}
                  onChange={(e) => setBusinessSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white w-64 md:w-80 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {['ALL', 'PENDING', 'ACTIVE', 'APPROVED', 'SUSPENDED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBusinessStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      businessStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              to="/register-business"
              iconLeft={Building2}
            >
              Register New Business
            </Button>
          </div>

          {/* Businesses Table */}
          <Card className="border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Business Name & Category</th>
                    <th className="py-3.5 px-4">Owner Contact</th>
                    <th className="py-3.5 px-4">Registration No. / GSTIN</th>
                    <th className="py-3.5 px-4">Plan Tier</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No businesses found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBusinesses.map((biz) => {
                      const bizStatus = (biz.status || 'ACTIVE').toUpperCase();
                      return (
                        <tr key={biz.id || biz._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                {biz.logo ? (
                                  <img src={biz.logo} alt="" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  biz.name.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{biz.name}</div>
                                <div className="text-[11px] text-slate-500">{biz.category || biz.industry || 'Enterprise'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">{biz.ownerName || 'Designated Owner'}</div>
                            <div className="text-[11px] text-slate-500">{biz.ownerEmail || biz.businessEmail}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-[11px] text-slate-700">{biz.registrationNumber || 'N/A'}</div>
                            {biz.gstin && (
                              <div className="text-[10px] text-slate-400 font-mono">GST: {biz.gstin}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold uppercase text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              {biz.plan || 'STARTER'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {bizStatus === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                PENDING
                              </span>
                            )}
                            {bizStatus === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                ACTIVE
                              </span>
                            )}
                            {bizStatus === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                                APPROVED
                              </span>
                            )}
                            {bizStatus === 'SUSPENDED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                SUSPENDED
                              </span>
                            )}
                            {bizStatus === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                                REJECTED
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  setSelectedBusiness(biz);
                                  setViewDetailsModalOpen(true);
                                }}
                                title="View All 12 Fields"
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit Business */}
                              <button
                                onClick={() => openEditBusinessModal(biz)}
                                title="Edit Information"
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Action: Pending -> Approve / Reject */}
                              {bizStatus === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApproveBusiness(biz)}
                                    title="Approve Business"
                                    className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openActionModal(biz, 'REJECT')}
                                    title="Reject Application"
                                    className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 font-bold text-xs hover:bg-rose-200 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Action: Active -> Suspend */}
                              {(bizStatus === 'ACTIVE' || bizStatus === 'APPROVED') && (
                                <button
                                  onClick={() => openActionModal(biz, 'SUSPEND')}
                                  title="Suspend Business"
                                  className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold text-xs hover:bg-amber-200 transition-colors"
                                >
                                  Suspend
                                </button>
                              )}

                              {/* Action: Suspended / Rejected -> Reactivate */}
                              {(bizStatus === 'SUSPENDED' || bizStatus === 'REJECTED') && (
                                <button
                                  onClick={() => handleReactivateBusiness(biz)}
                                  title="Reactivate Business"
                                  className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SUBSCRIPTION MANAGEMENT (4 PLANS, EDIT MODAL, REAL GATEWAY INTENT) */}
      {/* ========================================================================= */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">4 Managed Platform Subscription Tiers</h2>
              <p className="text-xs text-slate-500">Configure monthly/yearly pricing, member quotas, storage quotas, and feature flags</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaymentGatewayModalOpen(true)}
              iconLeft={DollarSign}
            >
              Test Payment Gateway Intent
            </Button>
          </div>

          {/* 4 Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => (
              <Card key={p._id || p.code} className="p-5 border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">{p.name}</span>
                    <Badge variant={p.code === 'ENTERPRISE' ? 'primary' : 'default'} size="xs">
                      {p.code}
                    </Badge>
                  </div>

                  <div className="my-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">${p.monthlyPrice}</span>
                      <span className="text-xs text-slate-500">/mo</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ${p.yearlyPrice}/yr billed annually
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 min-h-[36px]">{p.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">Team Seats:</span>
                      <span className="font-semibold">{p.employeeLimit === 9999 ? 'Unlimited' : p.employeeLimit} members</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">Storage Limit:</span>
                      <span className="font-semibold">{p.storageLimitGb} GB Cloud</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">Included Modules:</span>
                      <span className="font-semibold">{p.moduleAccess?.length || 0} modules</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditPlanModal(p)}
                    className="w-full text-xs font-semibold"
                    iconLeft={Edit}
                  >
                    Edit Plan Limits
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Subscriptions List & Expiration Tracking */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Tenant Subscriptions & Renewal Tracking</h3>
            <Card className="border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Business</th>
                    <th className="py-3 px-4">Plan Tier</th>
                    <th className="py-3 px-4">Billing Cycle</th>
                    <th className="py-3 px-4">Renewal / Expiry Date</th>
                    <th className="py-3 px-4">Auto-Renew</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {subscriptionsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No active subscriptions provisioned yet.
                      </td>
                    </tr>
                  ) : (
                    subscriptionsList.map((sub: any) => (
                      <tr key={sub._id || sub.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {sub.businessId?.name || 'Nexus Organization'}
                        </td>
                        <td className="py-3 px-4 uppercase font-bold text-blue-600">
                          {sub.plan || 'STARTER'}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600">
                          {sub.billingCycle || 'monthly'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {sub.currentPeriodEnd
                            ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                            : 'Active Continuous'}
                        </td>
                        <td className="py-3 px-4">
                          {sub.autoRenew !== false ? (
                            <span className="text-emerald-600 font-bold">Enabled</span>
                          ) : (
                            <span className="text-slate-400">Manual</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={sub.status === 'active' ? 'success' : 'warning'}
                            size="xs"
                          >
                            {(sub.status || 'active').toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: USER MANAGEMENT (SEARCH, FILTER BY ROLE/BIZ, ACTIVATE/DEACTIVATE) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white w-64 md:w-80 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Role filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="CUSTOMER">CUSTOMER</option>
              </select>
            </div>
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> of {usersList.length} users
            </div>
          </div>

          <Card className="border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Tenant Business</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No users match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'BUSINESS_OWNER'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'MANAGER'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {u.businessId ? (
                          <span className="font-medium text-slate-900">{u.businessId.name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Platform Wide</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={u.status === 'active' ? 'success' : 'danger'}
                          size="xs"
                        >
                          {u.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setViewUserModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                            title="View User"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {u.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                                u.status === 'active'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {u.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT LOGS (TIMELINE, BUSINESS CREATION, APPROVAL, CHANGES) */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Platform Governance Audit Trail</h2>
              <p className="text-xs text-slate-500">Tamper-evident logs of business onboarding, status transitions, role grants, and settings</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Module:</span>
              <select
                value={auditModuleFilter}
                onChange={(e) => setAuditModuleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
              >
                <option value="ALL">All Modules</option>
                <option value="admin">Admin Operations</option>
                <option value="business">Business Registrations</option>
                <option value="auth">Authentication</option>
                <option value="subscription">Subscriptions & Billing</option>
              </select>
            </div>
          </div>

          <Card className="border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Target Business</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Summary Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No audit events recorded for selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => {
                    const bizName =
                      typeof log.businessId === 'object' && log.businessId !== null
                        ? log.businessId.name
                        : 'Platform Wide';
                    const userName =
                      typeof log.userId === 'object' && log.userId !== null
                        ? log.userId.name
                        : (log.userName || 'System');

                    return (
                      <tr key={log._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(log.timestamp || log.createdAt || Date.now()).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 capitalize">
                          {log.module}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{bizName}</td>
                        <td className="py-3 px-4 text-slate-600">{userName}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.description}>
                          {log.description}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ADMIN SETTINGS (PLATFORM NAME, LOGO, GENERAL, EMAIL, SECURITY) */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Platform Global Administration Settings</h2>
              <p className="text-xs text-slate-500">Configure core SaaS parameters, SMTP credentials, security thresholds, and billing rules</p>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              iconLeft={Check}
            >
              Save Configuration
            </Button>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Platform settings updated and cached successfully!</span>
            </div>
          )}

          {/* 1. Identity & Branding */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              1. Platform Brand & Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Platform Logo URL</label>
                <input
                  type="text"
                  value={settings.logo || ''}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value || null })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                  placeholder="https://example.com/logo.svg"
                />
              </div>
            </div>
          </Card>

          {/* 2. General Settings */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              2. General System Operations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Support Email</label>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, supportEmail: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Support Contact Phone</label>
                <input
                  type="text"
                  value={settings.general.contactPhone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, contactPhone: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Default Timezone</label>
                <input
                  type="text"
                  value={settings.general.defaultTimezone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, defaultTimezone: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* 3. Security & Access Control */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              3. Security & Access Control
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeoutMinutes: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Lockout Duration (Mins)</label>
                <input
                  type="number"
                  value={settings.security.lockDurationMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, lockDurationMinutes: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={settings.security.requireMfa}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, requireMfa: e.target.checked }
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                  />
                  Enforce MFA for Admins
                </label>
              </div>
            </div>
          </Card>

          {/* 4. Email & SMTP Settings */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-600" />
              4. Email & Notification Server (SMTP)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpHost: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">SMTP Port</label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPort: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">SMTP Username</label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpUser: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Default Sender Email</label>
                <input
                  type="email"
                  value={settings.email.smtpFrom}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpFrom: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* 5. Subscription & Finance Defaults */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              5. Subscription & Pricing Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Default Currency</label>
                <select
                  value={settings.subscription.defaultCurrency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      subscription: { ...settings.subscription, defaultCurrency: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Free Trial Days</label>
                <input
                  type="number"
                  value={settings.subscription.freeTrialDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      subscription: { ...settings.subscription, freeTrialDays: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Tax / GST %</label>
                <input
                  type="number"
                  value={settings.subscription.taxPercentage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      subscription: { ...settings.subscription, taxPercentage: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Invoice Prefix</label>
                <input
                  type="text"
                  value={settings.subscription.invoicePrefix}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      subscription: { ...settings.subscription, invoicePrefix: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </Card>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW BUSINESS DETAILS (ALL 12 FIELDS) */}
      {/* ========================================================================= */}
      {viewDetailsModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {selectedBusiness.logo ? (
                    <img src={selectedBusiness.logo} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    selectedBusiness.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedBusiness.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{selectedBusiness.category || selectedBusiness.industry}</span>
                    <span className="text-slate-300">•</span>
                    <Badge variant={selectedBusiness.status === 'ACTIVE' ? 'success' : 'warning'} size="xs">
                      {(selectedBusiness.status || 'ACTIVE').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewDetailsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 12 Business Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">1. Business Name</span>
                <p className="font-bold text-slate-900">{selectedBusiness.name}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">2. Business Logo</span>
                <p className="font-mono text-slate-700 truncate">{selectedBusiness.logo || 'Not provided'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">3. Business Email</span>
                <p className="font-bold text-slate-900">{selectedBusiness.businessEmail || selectedBusiness.contactEmail || 'N/A'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">4. Phone Number</span>
                <p className="font-bold text-slate-900">{selectedBusiness.phone || 'N/A'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">5. Physical Address</span>
                <p className="font-medium text-slate-800">
                  {selectedBusiness.address
                    ? `${selectedBusiness.address.street || ''}, ${selectedBusiness.address.city || ''}, ${selectedBusiness.address.state || ''} ${selectedBusiness.address.postalCode || ''}, ${selectedBusiness.address.country || 'US'}`
                    : 'Address not recorded'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">6. Category / Industry</span>
                <p className="font-bold text-slate-900">{selectedBusiness.category || selectedBusiness.industry || 'Technology'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">7. Registration Number</span>
                <p className="font-mono font-bold text-slate-900">{selectedBusiness.registrationNumber || 'Pending verification'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">8. GSTIN / Tax ID</span>
                <p className="font-mono font-bold text-slate-900">{selectedBusiness.gstin || 'Not provided'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">9. Official Website</span>
                <p className="font-medium text-blue-600 truncate">{selectedBusiness.website || 'N/A'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">10. Business Description</span>
                <p className="text-slate-700 leading-relaxed">{selectedBusiness.description || 'No description filed.'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">11. Owner Full Name</span>
                <p className="font-bold text-slate-900">{selectedBusiness.ownerName || 'Designated Representative'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">12. Owner Email Address</span>
                <p className="font-bold text-slate-900">{selectedBusiness.ownerEmail || 'N/A'}</p>
              </div>
            </div>

            {/* Rejection / Suspension Notice if applicable */}
            {selectedBusiness.rejectionReason && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs space-y-1">
                <div className="font-bold">Rejection Note:</div>
                <div>{selectedBusiness.rejectionReason}</div>
              </div>
            )}
            {selectedBusiness.suspensionReason && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs space-y-1">
                <div className="font-bold">Suspension Note:</div>
                <div>{selectedBusiness.suspensionReason}</div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewDetailsModalOpen(false)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ACTION WITH REASON (REJECT OR SUSPEND) */}
      {/* ========================================================================= */}
      {actionReasonModalOpen && selectedBusiness && actionType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'REJECT' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {actionType === 'REJECT' ? 'Reject Business Application' : 'Suspend Active Business'}
                </h3>
                <p className="text-xs text-slate-500">{selectedBusiness.name}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Reason for {actionType === 'REJECT' ? 'Rejection' : 'Suspension'} (Will be notified to Owner)
              </label>
              <textarea
                rows={3}
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="State the regulatory, verification, or operational reason..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActionReasonModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'REJECT' ? 'danger' : 'primary'}
                size="sm"
                onClick={handleConfirmActionWithReason}
                className={actionType === 'SUSPEND' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                Confirm {actionType}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT BUSINESS INFORMATION */}
      {/* ========================================================================= */}
      {editBusinessModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBusinessEdit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Business Information</h3>
              <button
                type="button"
                onClick={() => setEditBusinessModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={editBusinessData.name || ''}
                  onChange={(e) => setEditBusinessData({ ...editBusinessData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editBusinessData.category || ''}
                  onChange={(e) => setEditBusinessData({ ...editBusinessData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={editBusinessData.businessEmail || ''}
                    onChange={(e) => setEditBusinessData({ ...editBusinessData, businessEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editBusinessData.phone || ''}
                    onChange={(e) => setEditBusinessData({ ...editBusinessData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website</label>
                <input
                  type="url"
                  value={editBusinessData.website || ''}
                  onChange={(e) => setEditBusinessData({ ...editBusinessData, website: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editBusinessData.description || ''}
                  onChange={(e) => setEditBusinessData({ ...editBusinessData, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditBusinessModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT SUBSCRIPTION PLAN (PRICING & LIMITS) */}
      {/* ========================================================================= */}
      {editPlanModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePlanEdit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit {editingPlan.name} Plan</h3>
              <button
                type="button"
                onClick={() => setEditPlanModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingPlan.monthlyPrice}
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Yearly Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingPlan.yearlyPrice}
                    onChange={(e) => setEditingPlan({ ...editingPlan, yearlyPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee Limit</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingPlan.employeeLimit}
                    onChange={(e) => setEditingPlan({ ...editingPlan, employeeLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage Limit (GB)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingPlan.storageLimitGb}
                    onChange={(e) => setEditingPlan({ ...editingPlan, storageLimitGb: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditPlanModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Plan Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PAYMENT GATEWAY ARCHITECTURE TEST (STRIPE / RAZORPAY INTENT) */}
      {/* ========================================================================= */}
      {paymentGatewayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Payment Gateway Architecture Inspector</h3>
                  <p className="text-xs text-slate-500">Stripe & Razorpay cryptographic order intent (Strictly no fake success)</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentGatewayModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePaymentIntent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Business Organization</label>
                  <select
                    value={gatewayForm.businessId}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, businessId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:border-blue-500"
                  >
                    <option value="">Select a registered business...</option>
                    {businesses.map((b) => (
                      <option key={b.id || b._id} value={b.id || b._id}>
                        {b.name} ({b.plan || 'STARTER'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plan Tier</label>
                  <select
                    value={gatewayForm.planCode}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, planCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:border-blue-500"
                  >
                    <option value="FREE">FREE</option>
                    <option value="STARTER">STARTER</option>
                    <option value="PROFESSIONAL">PROFESSIONAL</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Cycle</label>
                  <select
                    value={gatewayForm.billingCycle}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, billingCycle: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:border-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual (Discounted)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Provider</label>
                  <select
                    value={gatewayForm.provider}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, provider: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:border-blue-500"
                  >
                    <option value="stripe">Stripe Payments (Cards, Apple Pay)</option>
                    <option value="razorpay">Razorpay (UPI, NetBanking, INR)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" type="submit">
                  Generate Cryptographic Intent
                </Button>
              </div>
            </form>

            {/* Generated Order Intent Output */}
            {gatewayIntentResult && (
              <div className="p-4 bg-slate-900 rounded-xl text-slate-100 text-xs space-y-3 font-mono border border-slate-800">
                <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800 text-[11px]">
                  <span>PROVIDER: {gatewayIntentResult.provider.toUpperCase()}</span>
                  <span className="text-emerald-400">STATUS: INTENT_CREATED</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">ORDER ID:</span>
                    <span className="text-white font-bold">{gatewayIntentResult.orderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">AMOUNT / CURRENCY:</span>
                    <span className="text-white font-bold">{gatewayIntentResult.amount} {gatewayIntentResult.currency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">PUBLIC KEY ID:</span>
                    <span className="text-white">{gatewayIntentResult.keyId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">WEBHOOK ENDPOINT:</span>
                    <span className="text-blue-400">{gatewayIntentResult.webhookEndpoint}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-1">Architectural Verification:</span>
                  {gatewayIntentResult.instructions}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: VIEW USER DETAILS */}
      {/* ========================================================================= */}
      {viewUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">User Profile Details</h3>
              <button
                onClick={() => setViewUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Name</span>
                <span className="font-bold text-slate-900">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="font-bold text-slate-900">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Role</span>
                <span className="font-bold text-purple-700">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Business Tenant</span>
                <span className="font-medium text-slate-900">
                  {selectedUser.businessId ? selectedUser.businessId.name : 'Platform Wide'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className="font-bold uppercase text-emerald-600">{selectedUser.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered On</span>
                <span className="text-slate-700">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewUserModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Supporting Clock Icon Component
const ClockIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default SuperAdminDashboard;
