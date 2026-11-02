import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import salesService from '../../services/salesService';
import crmService from '../../services/crmService';
import {
  ISalesOrder,
  ISalesAnalyticsData,
  SalesOrderStatusOption,
  SalesOrderPaymentOption,
  ICustomerItem
} from '../../types';
import {
  TrendingUp,
  Search,
  Plus,
  Printer,
  Ban,
  ShoppingBag,
  X,
  AlertCircle,
  FileText,
  Trash2,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const SalesOrdersPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Active Tab: 'orders' | 'analytics'
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics'>('orders');

  // Orders State
  const [orders, setOrders] = useState<ISalesOrder[]>([]);
  const [analytics, setAnalytics] = useState<ISalesAnalyticsData | null>(null);
  const [customers, setCustomers] = useState<ICustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Selected Order
  const [selectedOrder, setSelectedOrder] = useState<ISalesOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Create Order Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState<
    Array<{
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      tax: number;
    }>
  >([
    { productName: 'Standard Enterprise License', sku: 'LIC-001', quantity: 1, unitPrice: 500, discount: 0, tax: 18 }
  ]);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const taxRate = 18;
  const [orderNotes, setOrderNotes] = useState('');
  const [initialStatus, setInitialStatus] = useState<SalesOrderStatusOption>('CONFIRMED');
  const [initialPaymentStatus, setInitialPaymentStatus] = useState<SalesOrderPaymentOption>('PAID');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await salesService.listSalesOrders(businessId, {
        search: searchTerm,
        status: statusFilter,
        page,
        limit: 15
      });
      setOrders(res.orders || []);
      setTotalOrdersCount(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load sales orders.');
    } finally {
      setLoading(false);
    }
  }, [businessId, searchTerm, statusFilter, page]);

  const fetchAnalytics = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await salesService.getSalesAnalytics(businessId);
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    }
  }, [businessId]);

  const fetchCustomersList = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await crmService.listCustomers(businessId, { limit: 100 });
      setCustomers(res.customers || []);
      if (res.customers && res.customers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(res.customers[0]._id);
      }
    } catch {
      setCustomers([]);
    }
  }, [businessId, selectedCustomerId]);

  useEffect(() => {
    fetchOrders();
    fetchAnalytics();
    fetchCustomersList();
  }, [fetchOrders, fetchAnalytics, fetchCustomersList]);

  // Live client preview calculation (server validates and calculates authoritatively)
  const previewSubtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const previewItemTax = orderItems.reduce((sum, item) => {
    const net = Math.max(0, item.quantity * item.unitPrice - (item.discount || 0));
    return sum + (net * ((item.tax || 0) / 100));
  }, 0);
  const previewTotal = Math.max(
    0,
    previewSubtotal - overallDiscount + previewItemTax + Number(shippingFee || 0)
  );

  const handleAddItemRow = () => {
    setOrderItems([
      ...orderItems,
      { productName: '', sku: '', quantity: 1, unitPrice: 100, discount: 0, tax: 18 }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    (updated[index] as any)[field] = value;
    setOrderItems(updated);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !selectedCustomerId) {
      setErrorMsg('Please select a customer for this order.');
      return;
    }
    try {
      setActionLoading(true);
      setErrorMsg('');

      const customer = customers.find((c) => c._id === selectedCustomerId);

      const payload = {
        customerId: selectedCustomerId,
        customerName: customer?.fullName || customer?.name,
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        items: orderItems.map((i) => ({
          productName: i.productName || 'Custom Product Item',
          sku: i.sku,
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice) || 0,
          discount: Number(i.discount) || 0,
          tax: Number(i.tax) || 0
        })),
        taxRate,
        discountAmount: Number(overallDiscount) || 0,
        shippingFee: Number(shippingFee) || 0,
        notes: orderNotes,
        status: initialStatus,
        paymentStatus: initialPaymentStatus
      };

      const created = await salesService.createSalesOrder(businessId, payload);
      setSuccessMsg(`Sales order ${created.orderNumber} generated successfully with verified totals.`);
      setShowCreateModal(false);
      fetchOrders();
      fetchAnalytics();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create sales order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: SalesOrderStatusOption) => {
    if (!businessId) return;
    try {
      await salesService.updateOrderStatus(businessId, orderId, status);
      setSuccessMsg(`Order status updated to ${status}.`);
      fetchOrders();
      fetchAnalytics();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update order status.');
    }
  };

  const handleCancelOrderConfirm = async () => {
    if (!businessId || !selectedOrder) return;
    try {
      setActionLoading(true);
      await salesService.cancelSalesOrder(businessId, selectedOrder._id, cancelReason);
      setSuccessMsg(`Order ${selectedOrder.orderNumber} cancelled. Product inventory has been restored.`);
      setShowCancelModal(false);
      setCancelReason('');
      fetchOrders();
      fetchAnalytics();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to cancel order.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">CONFIRMED</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">PROCESSING</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">SHIPPED</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">DELIVERED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">PAID</span>;
      case 'PARTIAL':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">PARTIAL</span>;
      case 'REFUNDED':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">REFUNDED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">UNPAID</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            Sales & Orders Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate verifiable orders, process shipments, restore cancelled inventory, and monitor real-time sales analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setOrderItems([
                { productName: 'Standard Enterprise License', sku: 'LIC-001', quantity: 1, unitPrice: 500, discount: 0, tax: 18 }
              ]);
              setOverallDiscount(0);
              setShippingFee(0);
              setOrderNotes('');
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create Sales Order
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Sales Orders ({totalOrdersCount})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Sales Analytics & Insights
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: ORDERS LIST
          ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Total Sales Revenue</span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  ${analytics.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Orders Count</span>
                <div className="text-xl font-bold text-slate-900 mt-1">{analytics.totalOrders}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Avg Order Value</span>
                <div className="text-xl font-bold text-emerald-600 mt-1">
                  ${analytics.averageOrderValue.toFixed(2)}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Pending Processing</span>
                <div className="text-xl font-bold text-indigo-600 mt-1">{analytics.pendingOrdersCount}</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by order number or customer name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="px-5 py-3.5">Order Number</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5 text-right">Items</th>
                    <th className="px-5 py-3.5 text-right">Total Amount</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent mb-2"></div>
                        <div>Loading sales orders...</div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-base font-medium text-slate-700">No orders recorded</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Use the "Create Sales Order" button above to generate verified orders.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4 font-mono font-bold text-indigo-600">
                          {order.orderNumber}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">{order.customerName}</div>
                          <div className="text-xs text-slate-500">{order.customerEmail}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-5 py-4">{getPaymentBadge(order.paymentStatus)}</td>
                        <td className="px-5 py-4 text-right font-medium text-slate-700">
                          {order.items?.length || 0}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-900">
                          ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Invoice View */}
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowInvoiceModal(true);
                              }}
                              title="Printable Invoice"
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Status Selector */}
                            {order.status !== 'CANCELLED' && (
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order._id, e.target.value as any)}
                                className="text-xs py-1 px-1.5 border border-slate-300 rounded font-semibold text-slate-700"
                              >
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                              </select>
                            )}

                            {/* Cancel Order */}
                            {order.status !== 'CANCELLED' && (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowCancelModal(true);
                                }}
                                title="Cancel Order & Restore Inventory"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SALES ANALYTICS
          ========================================================================= */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                ${analytics.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-1">Across all completed orders</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
              <div className="text-2xl font-bold text-indigo-600 mt-2">{analytics.totalOrders}</div>
              <p className="text-xs text-slate-400 mt-1">Processed transactions</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Order Value</span>
              <div className="text-2xl font-bold text-emerald-600 mt-2">
                ${analytics.averageOrderValue.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Net revenue per order</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Conversion Rate</span>
              <div className="text-2xl font-bold text-purple-600 mt-2">
                {analytics.conversionRate}%
              </div>
              <p className="text-xs text-slate-400 mt-1">{analytics.wonLeadsCount} Won leads out of pipeline</p>
            </div>
          </div>

          {/* Monthly Sales Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Monthly Revenue Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} tickFormatter={(val) => `$${val}`} />
                  <Tooltip formatter={(value: any) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="sales" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pipeline Distribution Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Pipeline Value by Stage</h3>
              <div className="space-y-2.5">
                {analytics.pipelineDistribution.map((item) => (
                  <div key={item.stage} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">{item.stage}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500">{item.count} leads</span>
                      <span className="font-bold text-slate-900 w-24 text-right">
                        ${item.totalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Top Accounts by Spend</h3>
              <div className="space-y-2.5">
                {analytics.salesByCustomer.length === 0 ? (
                  <div className="text-xs text-slate-400 py-6 text-center">No customer spend on record yet.</div>
                ) : (
                  analytics.salesByCustomer.map((c) => (
                    <div key={c.customerId} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                      <div>
                        <div className="font-semibold text-slate-800">{c.customerName}</div>
                        <div className="text-[10px] text-slate-400">{c.ordersCount} orders</div>
                      </div>
                      <span className="font-bold text-emerald-700">
                        ${c.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE SALES ORDER (SERVER AUTHORITATIVE TOTALS)
          ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Generate Sales Order
              </h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <strong>Financial Verification Notice:</strong> All line item subtotals, tax calculations, and final amounts are calculated authoritatively on the server to prevent client-side price tampering.
              </div>

              {/* Customer selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Customer <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName || c.name} ({c.customerId}) &bull; {c.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">Order Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product Item
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Product Name</th>
                        <th className="p-2.5 w-24">SKU</th>
                        <th className="p-2.5 w-16 text-right">Qty</th>
                        <th className="p-2.5 w-24 text-right">Unit Price</th>
                        <th className="p-2.5 w-20 text-right">Tax (%)</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {orderItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={item.productName}
                              onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                              placeholder="Product Name"
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.sku}
                              onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                              placeholder="SKU"
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.tax}
                              onChange={(e) => handleItemChange(idx, 'tax', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {orderItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(idx)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Discounts & Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order Discount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={overallDiscount}
                    onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shipping Fee ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PROCESSING">PROCESSING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={initialPaymentStatus}
                    onChange={(e) => setInitialPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="PAID">PAID</option>
                    <option value="UNPAID">UNPAID</option>
                    <option value="PARTIAL">PARTIAL</option>
                  </select>
                </div>
              </div>

              {/* Total Summary Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Estimated Total (Before Server Verification):</span>
                <span className="font-bold text-slate-900 text-lg">
                  ${previewTotal.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Delivery terms, SLA requirements..."
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Calculating & Creating...' : 'Submit Sales Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INVOICE PRINTABLE DRAWER
          ========================================================================= */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Invoice Header */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">SALES INVOICE</h2>
                <div className="text-xs text-indigo-600 font-mono font-bold mt-1">
                  ORDER: {selectedOrder.orderNumber}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900">
                  {activeBusiness?.name || 'BizNexus Enterprise'}
                </span>
                <div className="text-xs text-slate-500">
                  Date: {new Date(selectedOrder.orderDate || selectedOrder.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="py-4 border-b border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Billed To:</span>
              <div className="font-semibold text-slate-900 text-sm">{selectedOrder.customerName}</div>
              <div className="text-slate-600">{selectedOrder.customerEmail}</div>
              {selectedOrder.customerPhone && <div className="text-slate-600">{selectedOrder.customerPhone}</div>}
            </div>

            {/* Items Table */}
            <div className="py-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Tax (%)</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium text-slate-800">{item.productName}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right">{item.tax || 0}%</td>
                      <td className="py-2 text-right font-semibold text-slate-900">
                        ${(item.itemTotal || item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="border-t border-slate-200 pt-4 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>${selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span>-${selectedOrder.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              {selectedOrder.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount:</span>
                  <span>+${selectedOrder.taxAmount?.toFixed(2)}</span>
                </div>
              )}
              {selectedOrder.shippingFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Shipping:</span>
                  <span>+${selectedOrder.shippingFee?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span>${selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CANCEL ORDER & RESTORE INVENTORY
          ========================================================================= */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <Ban className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Cancel Sales Order</h3>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to cancel order <strong className="text-slate-900">{selectedOrder.orderNumber}</strong>?
            </p>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <strong>Inventory Restoration:</strong> All product quantities associated with this order will be automatically returned to inventory stock, and customer lifetime spend will be adjusted.
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested refund / change of terms"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Abort
              </button>
              <button
                onClick={handleCancelOrderConfirm}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Order Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrdersPage;
