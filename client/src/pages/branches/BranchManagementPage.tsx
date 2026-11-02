import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import branchService from '../../services/branchService';
import inventoryService from '../../services/inventoryService';
import {
  IBranchItem,
  IBranchInput,
  IBranchAnalytics,
  BranchType,
  BranchStatus
} from '../../types';
import {
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Users,
  Boxes,
  ArrowRightLeft,
  BarChart3,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Star,
  Clock,
  DollarSign
} from 'lucide-react';

export const BranchManagementPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Branch List & Pagination State
  const [branches, setBranches] = useState<IBranchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals State
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<IBranchItem | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<IBranchAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferOriginBranch, setTransferOriginBranch] = useState<string>('');
  const [transferDestBranch, setTransferDestBranch] = useState<string>('');
  const [transferOriginWarehouse, setTransferOriginWarehouse] = useState<string>('');
  const [transferDestWarehouse, setTransferDestWarehouse] = useState<string>('');
  const [transferProduct, setTransferProduct] = useState<string>('');
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [transferSubmitting, setTransferSubmitting] = useState<boolean>(false);

  // Aux Data for Form/Transfer
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form Input State
  const [formCode, setFormCode] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formType, setFormType] = useState<BranchType>('RETAIL_STORE');
  const [formIsMain, setFormIsMain] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<BranchStatus>('ACTIVE');
  const [formStreet, setFormStreet] = useState<string>('');
  const [formCity, setFormCity] = useState<string>('');
  const [formState, setFormState] = useState<string>('');
  const [formPostalCode, setFormPostalCode] = useState<string>('');
  const [formCountry, setFormCountry] = useState<string>('India');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formTaxNumber, setFormTaxNumber] = useState<string>('');
  const [formOpenTime, setFormOpenTime] = useState<string>('09:00');
  const [formCloseTime, setFormCloseTime] = useState<string>('18:00');
  const [formCurrency, setFormCurrency] = useState<string>('USD');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Load Branches
  const loadBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await branchService.getBranches({
        search: search.trim() || undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      if (res && res.data) {
        setBranches(res.data.items || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve branches';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  // Load Auxiliary Data (warehouses & products) for transfers
  const loadAuxData = useCallback(async () => {
    if (!businessId) return;
    try {
      const [whRes, prodRes] = await Promise.all([
        inventoryService.listWarehouses(businessId),
        inventoryService.listProducts(businessId, { limit: 100 })
      ]);
      setWarehouses(whRes || []);
      setProducts(prodRes?.products || []);
    } catch {
      // Ignore aux error
    }
  }, [businessId]);

  useEffect(() => {
    loadBranches();
    loadAuxData();
  }, [loadBranches, loadAuxData]);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingBranch(null);
    setFormCode(`BR-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormType('RETAIL_STORE');
    setFormIsMain(branches.length === 0);
    setFormStatus('ACTIVE');
    setFormStreet('');
    setFormCity('');
    setFormState('');
    setFormPostalCode('');
    setFormCountry('India');
    setFormPhone('');
    setFormEmail('');
    setFormTaxNumber('');
    setFormOpenTime('09:00');
    setFormCloseTime('18:00');
    setFormCurrency(activeBusiness?.currency || 'USD');
    setShowFormModal(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (branch: IBranchItem) => {
    setEditingBranch(branch);
    setFormCode(branch.code);
    setFormName(branch.name);
    setFormType(branch.type);
    setFormIsMain(branch.isMainBranch);
    setFormStatus(branch.status);
    setFormStreet(branch.address?.street || '');
    setFormCity(branch.address?.city || '');
    setFormState(branch.address?.state || '');
    setFormPostalCode(branch.address?.postalCode || '');
    setFormCountry(branch.address?.country || 'India');
    setFormPhone(branch.contactPhone || '');
    setFormEmail(branch.contactEmail || '');
    setFormTaxNumber(branch.taxNumber || '');
    setFormOpenTime(branch.operatingHours?.openTime || '09:00');
    setFormCloseTime(branch.operatingHours?.closeTime || '18:00');
    setFormCurrency(branch.currency || 'USD');
    setShowFormModal(true);
  };

  // Submit Form (Create or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      setError('Branch code and name are required.');
      return;
    }

    setFormSubmitting(true);
    setError(null);

    const payload: IBranchInput = {
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      type: formType,
      isMainBranch: formIsMain,
      status: formStatus,
      address: {
        street: formStreet.trim(),
        city: formCity.trim(),
        state: formState.trim(),
        postalCode: formPostalCode.trim(),
        country: formCountry.trim()
      },
      contactPhone: formPhone.trim(),
      contactEmail: formEmail.trim() || undefined,
      taxNumber: formTaxNumber.trim(),
      operatingHours: {
        openTime: formOpenTime,
        closeTime: formCloseTime,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      currency: formCurrency
    };

    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch._id || editingBranch.id!, payload);
        showToast(`Branch '${payload.name}' updated successfully.`);
      } else {
        await branchService.createBranch(payload);
        showToast(`New branch '${payload.name}' established successfully.`);
      }
      setShowFormModal(false);
      loadBranches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Branch with Safeguards
  const handleDeleteBranch = async (branch: IBranchItem) => {
    if (branch.isMainBranch) {
      alert('Cannot delete primary headquarters/main branch. Designate another branch as main first.');
      return;
    }
    if ((branch.assignedWarehousesCount || 0) > 0) {
      alert(`Cannot delete '${branch.name}'. It has ${branch.assignedWarehousesCount} active warehouse(s) attached.`);
      return;
    }
    if ((branch.assignedEmployeesCount || 0) > 0) {
      alert(`Cannot delete '${branch.name}'. It has ${branch.assignedEmployeesCount} staff member(s) assigned.`);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete branch '${branch.name}' (${branch.code})?`);
    if (!confirmed) return;

    try {
      await branchService.deleteBranch(branch._id || branch.id!);
      showToast(`Branch '${branch.name}' deleted.`);
      loadBranches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete branch';
      setError(msg);
    }
  };

  // Open Performance Telemetry Modal
  const handleOpenAnalytics = async (branch: IBranchItem) => {
    setShowAnalyticsModal(true);
    setAnalyticsLoading(true);
    setAnalyticsData(null);
    try {
      const res = await branchService.getBranchAnalytics(branch._id || branch.id!);
      if (res && res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve telemetry';
      setError(msg);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Open Transfer Modal
  const handleOpenTransfer = () => {
    if (branches.length < 2) {
      alert('At least two branches must exist to perform an inter-branch stock transfer.');
      return;
    }
    setTransferOriginBranch(branches[0]._id || branches[0].id!);
    setTransferDestBranch(branches[1]._id || branches[1].id!);
    if (warehouses.length > 0) {
      setTransferOriginWarehouse(warehouses[0]._id || warehouses[0].id!);
      if (warehouses.length > 1) {
        setTransferDestWarehouse(warehouses[1]._id || warehouses[1].id!);
      } else {
        setTransferDestWarehouse(warehouses[0]._id || warehouses[0].id!);
      }
    }
    if (products.length > 0) {
      setTransferProduct(products[0]._id || products[0].id!);
    }
    setTransferQty(10);
    setTransferNotes('');
    setShowTransferModal(true);
  };

  // Submit Inter-Branch Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferOriginWarehouse || !transferDestWarehouse || !transferProduct || transferQty <= 0) {
      setError('Please provide all required transfer parameters.');
      return;
    }
    if (transferOriginWarehouse === transferDestWarehouse) {
      setError('Origin and destination warehouses cannot be the same.');
      return;
    }

    setTransferSubmitting(true);
    setError(null);

    try {
      const res = await branchService.transferStock({
        fromBranchId: transferOriginBranch,
        toBranchId: transferDestBranch,
        fromWarehouseId: transferOriginWarehouse,
        toWarehouseId: transferDestWarehouse,
        productId: transferProduct,
        quantity: Number(transferQty),
        notes: transferNotes
      });
      showToast(`Stock transfer ${res.data?.transferNumber || ''} completed successfully.`);
      setShowTransferModal(false);
      loadBranches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stock transfer failed';
      setError(msg);
    } finally {
      setTransferSubmitting(false);
    }
  };

  // Metrics computation
  const totalBranchesCount = branches.length;
  const hqCount = branches.filter((b) => b.type === 'HEADQUARTERS' || b.isMainBranch).length;
  const retailCount = branches.filter((b) => b.type === 'RETAIL_STORE').length;
  const officeCount = branches.filter((b) => b.type === 'REGIONAL_OFFICE' || b.type === 'WAREHOUSE_DEPOT').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center space-x-2">
              <span>Multi-Branch Management</span>
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                Enterprise Hub
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Location registry, localized warehouse hubs, staff assignments, and inter-branch inventory logistics for{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{activeBusiness?.name || 'Enterprise'}</span>
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleOpenTransfer}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs cursor-pointer transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 mr-1.5 text-blue-600" />
            Inter-Branch Transfer
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Branch
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center space-x-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 flex items-center space-x-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Locations</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalBranchesCount}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center">
            <Building2 className="w-3.5 h-3.5 mr-1 text-blue-500" />
            Across active network
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Headquarters & Hubs</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{hqCount}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center">
            <Star className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Primary operational anchor
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Retail Stores</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{retailCount}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center">
            <Boxes className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            Direct customer outlets
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Regional Depots</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{officeCount}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center">
            <Users className="w-3.5 h-3.5 mr-1 text-indigo-500" />
            Field logistics & offices
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search branch by name, code, or city..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">All Branch Types</option>
              <option value="HEADQUARTERS">Headquarters</option>
              <option value="RETAIL_STORE">Retail Store</option>
              <option value="WAREHOUSE_DEPOT">Warehouse Depot</option>
              <option value="REGIONAL_OFFICE">Regional Office</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => loadBranches()}
          disabled={loading}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors cursor-pointer shrink-0"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Branch Cards Directory */}
      {loading ? (
        <div className="p-16 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading branch locations...
        </div>
      ) : branches.length === 0 ? (
        <div className="p-16 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No branches registered</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Get started by adding your primary company headquarters or retail store location.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
          >
            Create Main Branch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {branches.map((branch) => {
            const isMain = branch.isMainBranch;
            const fullAddress = [
              branch.address?.city,
              branch.address?.state,
              branch.address?.country
            ]
              .filter(Boolean)
              .join(', ');

            return (
              <div
                key={branch._id || branch.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border transition-all p-5 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                  isMain
                    ? 'border-blue-500/80 ring-1 ring-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top: Code & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/50">
                          {branch.code}
                        </span>
                        {isMain && (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <Star className="w-2.5 h-2.5 mr-1 fill-amber-500 text-amber-500" />
                            Main HQ
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1.5 leading-snug">
                        {branch.name}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        branch.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {branch.status}
                    </span>
                  </div>

                  {/* Branch Type */}
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{branch.type.replace('_', ' ')}</span>
                  </div>

                  {/* Location Info */}
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{fullAddress || branch.address?.street || 'Address on file'}</span>
                    </div>

                    {branch.contactPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{branch.contactPhone}</span>
                      </div>
                    )}

                    {branch.contactEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{branch.contactEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Operations Schedule */}
                  {branch.operatingHours && (
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900/60 rounded-lg text-[11px] flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="flex items-center text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        Hours
                      </span>
                      <span className="font-mono font-medium">
                        {branch.operatingHours.openTime} – {branch.operatingHours.closeTime}
                      </span>
                    </div>
                  )}

                  {/* Resources summary */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-gray-700/60 text-xs">
                    <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300">
                      <Boxes className="w-3.5 h-3.5 text-blue-500" />
                      <span>{branch.assignedWarehousesCount || 0} Warehouses</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{branch.assignedEmployeesCount || 0} Staff</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between mt-4">
                  <button
                    onClick={() => handleOpenAnalytics(branch)}
                    className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 mr-1" />
                    Telemetry
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(branch)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
                      title="Edit Branch"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!branch.isMainBranch && (
                      <button
                        onClick={() => handleDeleteBranch(branch)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT BRANCH */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Register New Location / Branch'}
                </h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. BR-001"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Manhattan Retail Outlet"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Branch Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as BranchType)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="RETAIL_STORE">Retail Store</option>
                    <option value="HEADQUARTERS">Headquarters</option>
                    <option value="WAREHOUSE_DEPOT">Warehouse Depot</option>
                    <option value="REGIONAL_OFFICE">Regional Office</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as BranchStatus)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  placeholder="e.g. 500 5th Avenue, Suite 1200"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="NY"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formPostalCode}
                    onChange={(e) => setFormPostalCode(e.target.value)}
                    placeholder="10110"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 212-555-0199"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="branch@nexuscorp.com"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Operating Hours (Open - Close)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={formOpenTime}
                      onChange={(e) => setFormOpenTime(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={formCloseTime}
                      onChange={(e) => setFormCloseTime(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    GSTIN / Tax Number
                  </label>
                  <input
                    type="text"
                    value={formTaxNumber}
                    onChange={(e) => setFormTaxNumber(e.target.value)}
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white uppercase"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsMain}
                    onChange={(e) => setFormIsMain(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Designate as Primary Headquarters / Main Branch</div>
                    <div className="text-[11px] text-gray-500">Unsets any previous primary location for this company.</div>
                  </div>
                </label>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingBranch ? 'Update Branch' : 'Establish Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INTER-BRANCH STOCK TRANSFER */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Inter-Branch Inventory Transfer</h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Origin Branch
                  </label>
                  <select
                    value={transferOriginBranch}
                    onChange={(e) => setTransferOriginBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    {branches.map((b) => (
                      <option key={b._id || b.id} value={b._id || b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Destination Branch
                  </label>
                  <select
                    value={transferDestBranch}
                    onChange={(e) => setTransferDestBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    {branches
                      .filter((b) => (b._id || b.id) !== transferOriginBranch)
                      .map((b) => (
                        <option key={b._id || b.id} value={b._id || b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Origin Warehouse
                  </label>
                  <select
                    value={transferOriginWarehouse}
                    onChange={(e) => setTransferOriginWarehouse(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w._id || w.id} value={w._id || w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Destination Warehouse
                  </label>
                  <select
                    value={transferDestWarehouse}
                    onChange={(e) => setTransferDestWarehouse(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    {warehouses
                      .filter((w) => (w._id || w.id) !== transferOriginWarehouse)
                      .map((w) => (
                        <option key={w._id || w.id} value={w._id || w.id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Product to Transfer
                  </label>
                  <select
                    value={transferProduct}
                    onChange={(e) => setTransferProduct(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    {products.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Transfer Dispatch Notes
                </label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="e.g. Stock replenishment for weekend peak retail traffic"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {transferSubmitting ? 'Transferring...' : 'Execute Stock Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BRANCH TELEMETRY & PERFORMANCE */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Location Operational Telemetry
                </h3>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {analyticsLoading ? (
                <div className="py-12 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Calculating location performance...
                </div>
              ) : analyticsData ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                      {analyticsData.branchName} ({analyticsData.code})
                    </div>
                    <div className="text-[11px] text-gray-400 uppercase font-semibold mt-0.5">
                      {analyticsData.type.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/40">
                      <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                        Total Staff
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        {analyticsData.totalEmployees}
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
                      <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                        Warehouses
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        {analyticsData.totalWarehouses}
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/50 dark:border-indigo-800/40">
                      <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                        Orders Processed
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        {analyticsData.totalOrders}
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/40">
                      <div className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">
                        Inventory Value
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white mt-1 flex items-center">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                        {analyticsData.inventoryValuation.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-6">Telemetry unavailable.</div>
              )}

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right pt-4">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagementPage;

