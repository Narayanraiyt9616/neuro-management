import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import purchaseService from '../../services/purchaseService';
import inventoryService from '../../services/inventoryService';
import {
  ISupplierItem,
  IPurchaseOrder,
  IProductItem,
  IWarehouseItem
} from '../../types';
import {
  ShoppingCart,
  Building2,
  Search,
  Plus,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Receipt,
  DollarSign,
  PackageCheck,
  FileText,
  Printer
} from 'lucide-react';

export const PurchaseManagementPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Active Tab: 'orders' | 'suppliers' | 'receipts'
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers' | 'receipts'>('orders');

  // Main Data States
  const [orders, setOrders] = useState<IPurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplierItem[]>([]);
  const [products, setProducts] = useState<IProductItem[]>([]);
  const [warehouses, setWarehouses] = useState<IWarehouseItem[]>([]);

  // Filtering & Pagination
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showPODetailsModal, setShowPODetailsModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showSupplierDetailsModal, setShowSupplierDetailsModal] = useState(false);
  const [showDeleteSupplierModal, setShowDeleteSupplierModal] = useState(false);

  // Selected Entities
  const [selectedPO, setSelectedPO] = useState<IPurchaseOrder | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplierItem | null>(null);

  // Form States - Supplier
  const [supplierForm, setSupplierForm] = useState({
    supplierName: '',
    companyName: '',
    email: '',
    phone: '',
    contactPerson: '',
    gstin: '',
    paymentTerms: 'NET_30',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  // Form States - Purchase Order
  const [poForm, setPoForm] = useState({
    supplierId: '',
    warehouseId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    shippingCost: 0,
    paymentTerms: 'NET_30',
    notes: '',
    items: [
      {
        productId: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 18
      }
    ]
  });

  // Receive Form
  const [receiveForm, setReceiveForm] = useState<{
    notes: string;
    items: Array<{ productId: string; productName: string; remainingQuantity: number; quantityReceived: number }>;
  }>({
    notes: '',
    items: []
  });

  // Notification / Alert message
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const clearAlerts = () => {
    setActionSuccess(null);
    setActionError(null);
  };

  /**
   * Fetch All Required Data
   */
  const loadData = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      clearAlerts();

      // Parallel fetch
      const [posRes, suppliersRes, prodsRes, whRes] = await Promise.all([
        purchaseService.listPurchaseOrders(businessId, {
          search: searchTerm,
          status: statusFilter || undefined,
          supplierId: supplierFilter || undefined,
          page,
          limit: 15
        }),
        purchaseService.listSuppliers(businessId, {
          search: searchTerm,
          status: statusFilter || undefined
        }),
        inventoryService.listProducts(businessId, { limit: 100 }),
        inventoryService.listWarehouses(businessId)
      ]);

      setOrders(posRes.orders || []);
      setTotalPages(posRes.totalPages || 1);
      setSuppliers(suppliersRes || []);
      setProducts(prodsRes.products || []);
      setWarehouses(whRes || []);
    } catch (err: any) {
      console.error('Failed to load purchase management data:', err);
      setActionError(err.response?.data?.message || 'Failed to retrieve purchase orders or suppliers');
    } finally {
      setLoading(false);
    }
  }, [businessId, searchTerm, statusFilter, supplierFilter, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Supplier Handlers
   */
  const handleOpenAddSupplier = () => {
    setEditingSupplierId(null);
    setSupplierForm({
      supplierName: '',
      companyName: '',
      email: '',
      phone: '',
      contactPerson: '',
      gstin: '',
      paymentTerms: 'NET_30',
      status: 'ACTIVE',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    });
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (sup: ISupplierItem) => {
    setEditingSupplierId(sup._id);
    setSupplierForm({
      supplierName: sup.supplierName || '',
      companyName: sup.companyName || '',
      email: sup.email || '',
      phone: sup.phone || '',
      contactPerson: sup.contactPerson || '',
      gstin: sup.gstin || '',
      paymentTerms: sup.paymentTerms || 'NET_30',
      status: sup.status || 'ACTIVE',
      street: sup.address?.street || '',
      city: sup.address?.city || '',
      state: sup.address?.state || '',
      postalCode: sup.address?.postalCode || '',
      country: sup.address?.country || 'India'
    });
    setShowSupplierModal(true);
  };

  const handleSubmitSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    try {
      const payload: any = {
        supplierName: supplierForm.supplierName,
        companyName: supplierForm.companyName,
        email: supplierForm.email,
        phone: supplierForm.phone,
        contactPerson: supplierForm.contactPerson,
        gstin: supplierForm.gstin,
        paymentTerms: supplierForm.paymentTerms,
        status: supplierForm.status,
        address: {
          street: supplierForm.street,
          city: supplierForm.city,
          state: supplierForm.state,
          postalCode: supplierForm.postalCode,
          country: supplierForm.country
        }
      };

      if (editingSupplierId) {
        await purchaseService.updateSupplier(businessId, editingSupplierId, payload);
        setActionSuccess('Supplier updated successfully.');
      } else {
        await purchaseService.createSupplier(businessId, payload);
        setActionSuccess('Supplier registered successfully.');
      }
      setShowSupplierModal(false);
      loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to save supplier details.');
    }
  };

  const handleDeleteSupplier = async () => {
    if (!businessId || !selectedSupplier) return;
    try {
      await purchaseService.deleteSupplier(businessId, selectedSupplier._id);
      setActionSuccess(`Supplier "${selectedSupplier.supplierName}" deleted successfully.`);
      setShowDeleteSupplierModal(false);
      setSelectedSupplier(null);
      loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Cannot delete supplier with active purchase records.');
    }
  };

  /**
   * Purchase Order Handlers
   */
  const handleOpenCreatePO = () => {
    setPoForm({
      supplierId: suppliers[0]?._id || '',
      warehouseId: warehouses[0]?._id || '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      shippingCost: 0,
      paymentTerms: 'NET_30',
      notes: '',
      items: [
        {
          productId: products[0]?._id || '',
          quantity: 1,
          unitPrice: products[0]?.cost || products[0]?.price || 0,
          taxRate: products[0]?.taxRate || 18
        }
      ]
    });
    setShowCreatePOModal(true);
  };

  const handlePOItemChange = (index: number, field: string, value: any) => {
    const updated = [...poForm.items];
    const item = { ...updated[index], [field]: value };

    // If changing product, auto-fill unit purchase price and taxRate
    if (field === 'productId') {
      const match = products.find((p) => p._id === value);
      if (match) {
        item.unitPrice = match.cost || match.price || 0;
        item.taxRate = match.taxRate || 18;
      }
    }
    updated[index] = item;
    setPoForm({ ...poForm, items: updated });
  };

  const handleAddPOItem = () => {
    setPoForm({
      ...poForm,
      items: [
        ...poForm.items,
        {
          productId: products[0]?._id || '',
          quantity: 1,
          unitPrice: products[0]?.cost || 0,
          taxRate: 18
        }
      ]
    });
  };

  const handleRemovePOItem = (index: number) => {
    if (poForm.items.length <= 1) return;
    const updated = poForm.items.filter((_, idx) => idx !== index);
    setPoForm({ ...poForm, items: updated });
  };

  // Live totals calculation for PO form
  const calculatePOTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    poForm.items.forEach((item) => {
      const lineNet = Number(item.quantity) * Number(item.unitPrice);
      const lineTax = (lineNet * Number(item.taxRate)) / 100;
      subtotal += lineNet;
      taxAmount += lineTax;
    });
    const grandTotal = subtotal + taxAmount + Number(poForm.shippingCost || 0);
    return { subtotal, taxAmount, grandTotal };
  };

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    if (!poForm.supplierId) {
      setActionError('Please select a supplier.');
      return;
    }
    if (!poForm.warehouseId) {
      setActionError('Please select a destination warehouse.');
      return;
    }

    try {
      const payload = {
        supplierId: poForm.supplierId,
        warehouseId: poForm.warehouseId,
        orderDate: poForm.orderDate,
        expectedDeliveryDate: poForm.expectedDeliveryDate || undefined,
        shippingCost: Number(poForm.shippingCost) || 0,
        paymentTerms: poForm.paymentTerms,
        notes: poForm.notes,
        items: poForm.items.map((item) => {
          const prod = products.find((p) => p._id === item.productId);
          return {
            productId: item.productId,
            productName: prod?.name || 'Product',
            sku: prod?.sku || '',
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            taxRate: Number(item.taxRate)
          };
        })
      };

      await purchaseService.createPurchaseOrder(businessId, payload);
      setActionSuccess('Purchase Order created successfully in DRAFT status.');
      setShowCreatePOModal(false);
      loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to create purchase order.');
    }
  };

  const handleApprovePO = async (po: IPurchaseOrder) => {
    if (!businessId) return;
    try {
      await purchaseService.approvePurchaseOrder(businessId, po._id);
      setActionSuccess(`Purchase Order ${po.poNumber} approved. (Note: Stock increases strictly when items are received).`);
      loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to approve purchase order.');
    }
  };

  const handleCancelPO = async (po: IPurchaseOrder) => {
    if (!businessId) return;
    const confirm = window.confirm(`Are you sure you want to cancel Purchase Order ${po.poNumber}?`);
    if (!confirm) return;

    try {
      await purchaseService.cancelPurchaseOrder(businessId, po._id, 'Cancelled by user');
      setActionSuccess(`Purchase Order ${po.poNumber} cancelled.`);
      loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Cannot cancel this purchase order.');
    }
  };

  /**
   * Goods Receipt Handler (Partial / Full Receiving)
   */
  const handleOpenReceiveModal = (po: IPurchaseOrder) => {
    setSelectedPO(po);
    const receiveItems = po.items.map((item) => {
      const remaining = Math.max(0, item.quantity - (item.receivedQuantity || 0));
      return {
        productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
        productName: item.productName,
        remainingQuantity: remaining,
        quantityReceived: remaining // Default to remaining for full receive convenience
      };
    });

    setReceiveForm({
      notes: '',
      items: receiveItems
    });
    setShowReceiveModal(true);
  };

  const handleSubmitReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !selectedPO) return;

    const receivedPayload = receiveForm.items
      .filter((i) => i.quantityReceived > 0)
      .map((i) => ({
        productId: i.productId,
        quantityReceived: Number(i.quantityReceived)
      }));

    if (receivedPayload.length === 0) {
      setActionError('Please enter at least 1 unit received for any item.');
      return;
    }

    try {
      await purchaseService.receivePurchaseItems(businessId, selectedPO._id, {
        receivedItems: receivedPayload,
        notes: receiveForm.notes,
        idempotencyKey: `rcv-${selectedPO.poNumber}-${Date.now()}`
      });

      setActionSuccess(`Stock updated! Goods received and logged into warehouse stock & immutable Stock Ledger.`);
      setShowReceiveModal(false);
      setSelectedPO(null);
      loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to receive goods.');
    }
  };

  // Helper calculation for summary KPI metrics
  const activeSuppliersCount = suppliers.filter((s) => s.status === 'ACTIVE').length;
  const totalOutstandingBalance = suppliers.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);
  const pendingOrdersCount = orders.filter((o) => ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED'].includes(o.status)).length;
  const totalPurchaseSpend = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Status badge styling
  const getPOStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">DRAFT</span>;
      case 'PENDING_APPROVAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">PENDING APPROVAL</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">APPROVED</span>;
      case 'PARTIALLY_RECEIVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">PARTIAL RECEIPT</span>;
      case 'RECEIVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">RECEIVED</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">CANCELLED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getSupplierStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Active</span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Inactive</span>;
      case 'BLOCKED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Blocked</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Purchase & Supplier Management</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage supplier contracts, issue purchase orders, and safely receive goods into warehouse inventory.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddSupplier}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            Add Supplier
          </button>
          <button
            onClick={handleOpenCreatePO}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Purchase Volume</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalPurchaseSpend.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{orders.length} total purchase orders</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Awaiting Delivery / Approval</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingOrdersCount}</p>
            <p className="text-xs text-slate-400 mt-1">Pending receiving action</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Suppliers</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{activeSuppliersCount}</p>
            <p className="text-xs text-slate-400 mt-1">Out of {suppliers.length} vendors</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Outstanding Vendor Balance</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">₹{totalOutstandingBalance.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Payable under credit terms</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Purchase Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'suppliers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Suppliers Directory ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'receipts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            Goods Receiving History
          </button>
        </nav>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'suppliers' ? "Search suppliers by name, email, or code..." : "Search PO number, supplier, or items..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === 'orders' && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
            </>
          )}

          {activeTab === 'suppliers' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">PO Number</th>
                  <th className="px-6 py-3.5">Supplier</th>
                  <th className="px-6 py-3.5">Order Date</th>
                  <th className="px-6 py-3.5">Fulfillment</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">PO Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-slate-300 mb-2" />
                        <p className="font-medium text-slate-700">No purchase orders found</p>
                        <p className="text-xs text-slate-400 mt-1">Create your first purchase order to procure goods.</p>
                        <button
                          onClick={handleOpenCreatePO}
                          className="mt-4 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium"
                        >
                          New Purchase Order
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((po) => {
                    const totalQty = po.items.reduce((acc, i) => acc + i.quantity, 0);
                    const receivedQty = po.items.reduce((acc, i) => acc + (i.receivedQuantity || 0), 0);
                    const progressPercent = totalQty > 0 ? Math.round((receivedQty / totalQty) * 100) : 0;

                    return (
                      <tr key={po._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-indigo-600 whitespace-nowrap">
                          {po.poNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{po.supplierName}</div>
                          <div className="text-xs text-slate-400">{po.items.length} line item(s)</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-700">
                              {receivedQty}/{totalQty}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                          ₹{po.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getPOStatusBadge(po.status)}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Details */}
                            <button
                              onClick={() => {
                                setSelectedPO(po);
                                setShowPODetailsModal(true);
                              }}
                              title="View PO Details / Invoice"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Approve Button */}
                            {(po.status === 'DRAFT' || po.status === 'PENDING_APPROVAL') && (
                              <button
                                onClick={() => handleApprovePO(po)}
                                title="Approve Purchase Order"
                                className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            )}

                            {/* Receive Goods Button */}
                            {(po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED') && (
                              <button
                                onClick={() => handleOpenReceiveModal(po)}
                                title="Receive Goods into Warehouse"
                                className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-medium flex items-center gap-1 shadow-sm"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                Receive Items
                              </button>
                            )}

                            {/* Cancel Button */}
                            {['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(po.status) && (
                              <button
                                onClick={() => handleCancelPO(po)}
                                title="Cancel Order"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              >
                                <XCircle className="w-4 h-4" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded text-xs disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 border rounded text-xs disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUPPLIERS DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Supplier Code & Name</th>
                  <th className="px-6 py-3.5">Company & Contact</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Payment Terms</th>
                  <th className="px-6 py-3.5">Total Purchases</th>
                  <th className="px-6 py-3.5">Balance Payable</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      Loading suppliers...
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Building2 className="w-12 h-12 text-slate-300 mb-2" />
                        <p className="font-medium text-slate-700">No suppliers registered</p>
                        <p className="text-xs text-slate-400 mt-1">Register suppliers to create purchase orders and procure raw materials or stock.</p>
                        <button
                          onClick={handleOpenAddSupplier}
                          className="mt-4 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium"
                        >
                          Add Supplier
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  suppliers.map((sup) => (
                    <tr key={sup._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{sup.supplierName}</div>
                        <div className="text-xs text-slate-400">{sup.supplierCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium">{sup.companyName || '—'}</div>
                        <div className="text-xs text-slate-500">
                          {sup.contactPerson ? `${sup.contactPerson} • ` : ''}
                          {sup.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {sup.address?.city ? `${sup.address.city}, ${sup.address.state || ''}` : 'Not Specified'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                          {sup.paymentTerms}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        ₹{(sup.totalPurchases || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-rose-600 whitespace-nowrap">
                        ₹{(sup.outstandingBalance || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getSupplierStatusBadge(sup.status)}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedSupplier(sup);
                              setShowSupplierDetailsModal(true);
                            }}
                            title="View Supplier Profile & History"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditSupplier(sup)}
                            title="Edit Supplier"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSupplier(sup);
                              setShowDeleteSupplierModal(true);
                            }}
                            title="Delete Supplier"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* TAB 3: GOODS RECEIVING HISTORY */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Stock Receipt Audit Log</h2>
          <p className="text-sm text-slate-500 mb-6">
            Detailed log of physical warehouse intakes corresponding to purchase order receipts.
          </p>

          <div className="space-y-4">
            {orders
              .filter((o) => o.receiveHistory && o.receiveHistory.length > 0)
              .map((po) => (
                <div key={po._id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                    <div>
                      <span className="font-bold text-indigo-600">{po.poNumber}</span>
                      <span className="text-slate-600 text-sm ml-2">from {po.supplierName}</span>
                    </div>
                    <div>
                      {getPOStatusBadge(po.status)}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {po.receiveHistory?.map((receipt, rIdx) => (
                      <div key={rIdx} className="bg-white p-3 rounded border border-slate-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <PackageCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">
                            Batch received on {new Date(receipt.receivedDate).toLocaleDateString()}
                          </span>
                          {receipt.notes && (
                            <span className="text-slate-500 italic">({receipt.notes})</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {receipt.items.map((it, itIdx) => {
                            // Find line item to display name
                            const matched = po.items.find(
                              (pi) => (typeof pi.productId === 'object' ? pi.productId._id : pi.productId) === it.productId
                            );
                            return (
                              <span key={itIdx} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-medium">
                                {matched?.productName || 'Item'}: +{it.quantityReceived} units
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {orders.filter((o) => o.receiveHistory && o.receiveHistory.length > 0).length === 0 && (
              <div className="py-12 text-center text-slate-500">
                <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-slate-700">No goods receipt events logged yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Once an approved purchase order is received into a warehouse, receipt entries appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE PURCHASE ORDER */}
      {/* ========================================================================= */}
      {showCreatePOModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Create Purchase Order</h2>
              </div>
              <button onClick={() => setShowCreatePOModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPO} className="p-6 space-y-6">
              {/* Order Header Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={poForm.supplierId}
                    onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.supplierName} ({s.companyName || s.supplierCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Receiving Warehouse <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={poForm.warehouseId}
                    onChange={(e) => setPoForm({ ...poForm, warehouseId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Destination Warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Order Date</label>
                  <input
                    type="date"
                    required
                    value={poForm.orderDate}
                    onChange={(e) => setPoForm({ ...poForm, orderDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={poForm.expectedDeliveryDate}
                    onChange={(e) => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-800">Purchase Line Items</h3>
                  <button
                    type="button"
                    onClick={handleAddPOItem}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Item
                  </button>
                </div>

                <div className="space-y-3">
                  {poForm.items.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 items-end p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Product</label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => handlePOItemChange(index, 'productId', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        >
                          <option value="">Select Product</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} (SKU: {p.sku} | Cost: ₹{p.cost || 0})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Qty</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handlePOItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                      </div>

                      <div className="w-32">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Unit Cost (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handlePOItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tax Rate (%)</label>
                        <select
                          value={item.taxRate}
                          onChange={(e) => handlePOItemChange(index, 'taxRate', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>

                      <div className="w-32">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Line Total</label>
                        <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-800 text-right">
                          ₹{((item.quantity * item.unitPrice) * (1 + item.taxRate / 100)).toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemovePOItem(index)}
                          disabled={poForm.items.length <= 1}
                          className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Details & Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Shipping / Freight Cost (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={poForm.shippingCost}
                      onChange={(e) => setPoForm({ ...poForm, shippingCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Payment Terms</label>
                    <select
                      value={poForm.paymentTerms}
                      onChange={(e) => setPoForm({ ...poForm, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="IMMEDIATE">Immediate / Cash</option>
                      <option value="NET_15">Net 15 Days</option>
                      <option value="NET_30">Net 30 Days</option>
                      <option value="NET_60">Net 60 Days</option>
                      <option value="ADVANCE">100% Advance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Instructions</label>
                    <textarea
                      rows={2}
                      value={poForm.notes}
                      onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                      placeholder="Special delivery notes or terms..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Order Summary</h4>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{calculatePOTotals().subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Estimated GST:</span>
                    <span>₹{calculatePOTotals().taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping:</span>
                    <span>₹{Number(poForm.shippingCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                    <span>Grand Total:</span>
                    <span>₹{calculatePOTotals().grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreatePOModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECEIVE GOODS (PARTIAL RECEIVING SUPPORT) */}
      {/* ========================================================================= */}
      {showReceiveModal && selectedPO && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Receive Goods into Warehouse</h2>
                  <p className="text-xs text-slate-500">
                    PO: {selectedPO.poNumber} • Supplier: {selectedPO.supplierName}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowReceiveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReceive} className="p-6 space-y-5">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg">
                <strong>Warehouse Stock Policy:</strong> Stock in the destination warehouse will increase strictly by the quantities specified below. Movements will be permanently recorded in the Stock Ledger.
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Line Items Receiving Breakdown</h3>
                {receiveForm.items.map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between gap-4 bg-slate-50">
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-800">{item.productName}</div>
                      <div className="text-xs text-slate-500">Remaining to receive: {item.remainingQuantity} units</div>
                    </div>

                    <div className="w-32">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qty Received Now</label>
                      <input
                        type="number"
                        min="0"
                        max={item.remainingQuantity}
                        value={item.quantityReceived}
                        onChange={(e) => {
                          const updated = [...receiveForm.items];
                          updated[idx].quantityReceived = Math.min(
                            item.remainingQuantity,
                            Math.max(0, Number(e.target.value))
                          );
                          setReceiveForm({ ...receiveForm, items: updated });
                        }}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm text-right font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt / Delivery Notes</label>
                <textarea
                  rows={2}
                  value={receiveForm.notes}
                  onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
                  placeholder="e.g. Delivery Chalan #1234, inspected by Warehouse Manager"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm flex items-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4" />
                  Confirm Goods Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW PURCHASE ORDER DETAILS / INVOICE */}
      {/* ========================================================================= */}
      {showPODetailsModal && selectedPO && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Purchase Order Details</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-500 hover:text-slate-700 border rounded"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setShowPODetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Top Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <div>
                  <div className="text-xs text-slate-400">PO Number</div>
                  <div className="font-bold text-indigo-600">{selectedPO.poNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Status</div>
                  <div className="mt-0.5">{getPOStatusBadge(selectedPO.status)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Order Date</div>
                  <div className="font-semibold text-slate-800">{new Date(selectedPO.orderDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Payment Status</div>
                  <div className="font-semibold text-slate-800">{selectedPO.paymentStatus}</div>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vendor Information</h4>
                <div className="font-bold text-slate-900 text-base">{selectedPO.supplierName}</div>
                {selectedPO.notes && (
                  <div className="text-xs text-slate-500 mt-1">Instructions: {selectedPO.notes}</div>
                )}
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="px-4 py-2.5">Item</th>
                      <th className="px-4 py-2.5 text-center">Qty Ordered</th>
                      <th className="px-4 py-2.5 text-center">Qty Received</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Tax</th>
                      <th className="px-4 py-2.5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedPO.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {item.productName}
                          {item.sku && <span className="block text-xs text-slate-400">SKU: {item.sku}</span>}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-center font-bold text-emerald-600">
                          {item.receivedQuantity || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{item.taxRate}%</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          ₹{item.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{selectedPO.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST / Taxes:</span>
                    <span>₹{selectedPO.taxAmount.toFixed(2)}</span>
                  </div>
                  {selectedPO.shippingCost > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping:</span>
                      <span>₹{selectedPO.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base text-slate-900">
                    <span>Total Cost:</span>
                    <span>₹{selectedPO.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPODetailsModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SUPPLIER */}
      {/* ========================================================================= */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  {editingSupplierId ? 'Edit Supplier' : 'Register New Supplier'}
                </h2>
              </div>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSupplier} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierForm.supplierName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, supplierName: e.target.value })}
                    placeholder="e.g. Apex Hardware Supplies"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={supplierForm.companyName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })}
                    placeholder="e.g. Apex Global Corp Pvt Ltd"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="e.g. vendor@apex.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={supplierForm.gstin}
                    onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
                    placeholder="e.g. 29AAAAA0000A1Z5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="IMMEDIATE">Immediate</option>
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                    <option value="NET_60">Net 60 Days</option>
                    <option value="ADVANCE">Advance Required</option>
                    <option value="COD">Cash On Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={supplierForm.status}
                    onChange={(e) => setSupplierForm({ ...supplierForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>

              {/* Address details */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-600 uppercase mb-3">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={supplierForm.street}
                      onChange={(e) => setSupplierForm({ ...supplierForm, street: e.target.value })}
                      placeholder="e.g. 102 Industrial Area Phase 2"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      value={supplierForm.city}
                      onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
                    <input
                      type="text"
                      value={supplierForm.state}
                      onChange={(e) => setSupplierForm({ ...supplierForm, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={supplierForm.postalCode}
                      onChange={(e) => setSupplierForm({ ...supplierForm, postalCode: e.target.value })}
                      placeholder="e.g. 560001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                    <input
                      type="text"
                      value={supplierForm.country}
                      onChange={(e) => setSupplierForm({ ...supplierForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  {editingSupplierId ? 'Save Changes' : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW SUPPLIER DETAILS & PROFILE */}
      {/* ========================================================================= */}
      {showSupplierDetailsModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">{selectedSupplier.supplierName}</h2>
              </div>
              <button onClick={() => setShowSupplierDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-400">Supplier Code</div>
                  <div className="font-semibold text-slate-800">{selectedSupplier.supplierCode}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Status</div>
                  <div className="mt-0.5">{getSupplierStatusBadge(selectedSupplier.status)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Payment Terms</div>
                  <div className="font-semibold text-slate-800">{selectedSupplier.paymentTerms}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Total Purchases</div>
                  <div className="font-semibold text-slate-800">₹{(selectedSupplier.totalPurchases || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Total Paid</div>
                  <div className="font-semibold text-emerald-600">₹{(selectedSupplier.totalPaid || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Outstanding Balance</div>
                  <div className="font-semibold text-rose-600">₹{(selectedSupplier.outstandingBalance || 0).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Contact & Location</h4>
                <div className="space-y-1 text-sm text-slate-700">
                  <div><strong>Company:</strong> {selectedSupplier.companyName || '—'}</div>
                  <div><strong>Contact Person:</strong> {selectedSupplier.contactPerson || '—'}</div>
                  <div><strong>Email:</strong> {selectedSupplier.email}</div>
                  <div><strong>Phone:</strong> {selectedSupplier.phone}</div>
                  <div><strong>GSTIN:</strong> {selectedSupplier.gstin || 'Not Provided'}</div>
                  <div>
                    <strong>Address:</strong>{' '}
                    {selectedSupplier.address?.street
                      ? `${selectedSupplier.address.street}, ${selectedSupplier.address.city}, ${selectedSupplier.address.state} - ${selectedSupplier.address.postalCode}, ${selectedSupplier.address.country}`
                      : 'Not recorded'}
                  </div>
                </div>
              </div>

              {/* Purchase History with this supplier */}
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Purchase Orders Placed</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                      <tr>
                        <th className="px-3 py-2">PO #</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {orders
                        .filter((o) => (typeof o.supplierId === 'object' ? o.supplierId._id : o.supplierId) === selectedSupplier._id)
                        .map((po) => (
                          <tr key={po._id}>
                            <td className="px-3 py-2 font-medium text-indigo-600">{po.poNumber}</td>
                            <td className="px-3 py-2">{new Date(po.orderDate).toLocaleDateString()}</td>
                            <td className="px-3 py-2 font-semibold">₹{po.totalAmount.toLocaleString()}</td>
                            <td className="px-3 py-2">{getPOStatusBadge(po.status)}</td>
                          </tr>
                        ))}
                      {orders.filter((o) => (typeof o.supplierId === 'object' ? o.supplierId._id : o.supplierId) === selectedSupplier._id).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                            No purchase orders issued yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowSupplierDetailsModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE SUPPLIER SAFEGUARD */}
      {/* ========================================================================= */}
      {showDeleteSupplierModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-lg font-bold">Delete Supplier Record</h2>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete supplier <strong>{selectedSupplier.supplierName}</strong>?
            </p>
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
              Note: System safeguards prevent deletion if this supplier has active purchase orders or pending invoices.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteSupplierModal(false);
                  setSelectedSupplier(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSupplier}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium"
              >
                Delete Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManagementPage;
