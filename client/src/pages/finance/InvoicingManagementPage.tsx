import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import financeService from '../../services/financeService';
import crmService from '../../services/crmService';
import inventoryService from '../../services/inventoryService';
import {
  IInvoiceItemRecord,
  IInvoiceLineItem,
  ICustomerItem,
  IProductItem
} from '../../types';
import {
  Receipt,
  Search,
  Plus,
  Printer,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  CreditCard,
  Trash2,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';

export const InvoicingManagementPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Invoice list state
  const [invoices, setInvoices] = useState<IInvoiceItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoicesCount, setTotalInvoicesCount] = useState(0);

  // Reference data
  const [customers, setCustomers] = useState<ICustomerItem[]>([]);
  const [products, setProducts] = useState<IProductItem[]>([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoiceItemRecord | null>(null);

  // Notifications & Loaders
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'CHEQUE' | 'OTHER'>('BANK_TRANSFER');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Create Invoice form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState('Net 15 Days');
  const [notes, setNotes] = useState('Thank you for choosing BizNexus. Please make payment before the due date.');
  const [termsAndConditions, setTermsAndConditions] = useState(
    '1. Goods/Services once delivered are subject to standard warranty.\n2. Invoices overdue beyond 30 days are subject to 1.5% interest per month.\n3. All disputes subject to local jurisdiction.'
  );
  const [shippingCharges, setShippingCharges] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);

  // Line items state
  interface IFormLineItem {
    productId?: string;
    name: string;
    description: string;
    hsnSacCode: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    taxRate: number;
  }

  const [formItems, setFormItems] = useState<IFormLineItem[]>([
    {
      productId: '',
      name: 'Enterprise Software Subscription',
      description: 'Annual cloud subscription & license tier',
      hsnSacCode: '997331',
      quantity: 1,
      unit: 'units',
      unitPrice: 15000,
      discount: 0,
      taxRate: 18
    }
  ]);

  // Fetch Invoices
  const fetchInvoices = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await financeService.listInvoices(businessId, {
        search: searchTerm,
        status: statusFilter,
        page,
        limit: 12
      });
      setInvoices(res.invoices || []);
      setTotalInvoicesCount(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [businessId, searchTerm, statusFilter, page]);

  // Load Reference Customers & Products
  useEffect(() => {
    if (!businessId) return;
    crmService.listCustomers(businessId, { limit: 100 }).then((res) => {
      setCustomers(res.customers || []);
    }).catch(() => {});

    inventoryService.listProducts(businessId, { limit: 100 }).then((res) => {
      setProducts(res.products || []);
    }).catch(() => {});
  }, [businessId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Derived selected customer object
  const selectedCustomerObj = useMemo(() => {
    return customers.find((c) => c._id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Determine whether intra-state or inter-state for live calculation
  const isInterStateSupply = useMemo(() => {
    const bizState = (activeBusiness?.address?.state || 'Maharashtra').toLowerCase().trim();
    const custState = (selectedCustomerObj?.address?.state || 'Maharashtra').toLowerCase().trim();
    return bizState !== custState;
  }, [activeBusiness, selectedCustomerObj]);

  // Live item computations
  const computedInvoiceSummary = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    formItems.forEach((item) => {
      const lineGross = Math.round(item.quantity * item.unitPrice * 100) / 100;
      const lineDiscount = Math.round(Math.min(lineGross, item.discount || 0) * 100) / 100;
      const lineTaxable = Math.max(0, Math.round((lineGross - lineDiscount) * 100) / 100);
      const rate = item.taxRate || 0;
      const lineTax = Math.round((lineTaxable * rate) / 100 * 100) / 100;

      subtotal += lineGross;
      totalDiscount += lineDiscount;
      taxableAmount += lineTaxable;

      if (isInterStateSupply) {
        igstTotal += lineTax;
      } else {
        const half = Math.round((lineTax / 2) * 100) / 100;
        cgstTotal += half;
        sgstTotal += lineTax - half;
      }
    });

    const totalTax = isInterStateSupply ? igstTotal : cgstTotal + sgstTotal;
    const grandTotal = Math.round((taxableAmount + totalTax + (shippingCharges || 0) + (otherCharges || 0)) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      cgstTotal: Math.round(cgstTotal * 100) / 100,
      sgstTotal: Math.round(sgstTotal * 100) / 100,
      igstTotal: Math.round(igstTotal * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal
    };
  }, [formItems, isInterStateSupply, shippingCharges, otherCharges]);

  // Overview metrics from current invoices list
  const metrics = useMemo(() => {
    let grandSum = 0;
    let paidSum = 0;
    let balanceSum = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      grandSum += inv.grandTotal || 0;
      paidSum += inv.amountPaid || 0;
      balanceSum += inv.balanceDue || 0;
      if (inv.status === 'OVERDUE' || (inv.balanceDue > 0 && new Date(inv.dueDate) < new Date())) {
        overdueCount++;
      }
    });

    return {
      grandSum: Math.round(grandSum * 100) / 100,
      paidSum: Math.round(paidSum * 100) / 100,
      balanceSum: Math.round(balanceSum * 100) / 100,
      overdueCount
    };
  }, [invoices]);

  // Helper to add item row
  const handleAddItem = () => {
    setFormItems((prev) => [
      ...prev,
      {
        productId: '',
        name: '',
        description: '',
        hsnSacCode: '998313',
        quantity: 1,
        unit: 'units',
        unitPrice: 0,
        discount: 0,
        taxRate: 18
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length === 1) {
      setErrorMsg('Invoice must contain at least one line item.');
      return;
    }
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof IFormLineItem, value: any) => {
    setFormItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };

      // If user selected a product from inventory
      if (field === 'productId') {
        const prod = products.find((p) => p._id === value);
        if (prod) {
          target.name = prod.name;
          target.unitPrice = prod.price || prod.sellingPrice || prod.cost || 0;
          target.unit = 'units';
          target.taxRate = prod.taxRate || 18;
          target.hsnSacCode = prod.sku || '998313';
        }
      }
      copy[index] = target;
      return copy;
    });
  };

  // Submit Create Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      setErrorMsg('No active organization selected.');
      return;
    }
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer.');
      return;
    }
    if (formItems.some((it) => !it.name || it.quantity <= 0 || it.unitPrice < 0)) {
      setErrorMsg('Please ensure all items have valid names, quantities (> 0), and rates.');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg('');

      const payload = {
        customerId: selectedCustomerId,
        invoiceDate,
        dueDate,
        items: formItems.map((item) => ({
          productId: item.productId || undefined,
          name: item.name,
          description: item.description,
          hsnSacCode: item.hsnSacCode || '998313',
          quantity: Number(item.quantity),
          unit: item.unit || 'units',
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount || 0),
          taxRate: Number(item.taxRate || 0)
        })),
        shippingCharges: Number(shippingCharges || 0),
        otherCharges: Number(otherCharges || 0),
        paymentTerms,
        notes,
        termsAndConditions
      };

      await financeService.createInvoice(businessId, payload);
      setSuccessMsg('Invoice generated successfully with locked financial snapshot.');
      setShowCreateModal(false);
      // Reset form
      setFormItems([
        {
          productId: '',
          name: 'Enterprise Consulting Service',
          description: 'Consulting and integration delivery',
          hsnSacCode: '998313',
          quantity: 1,
          unit: 'units',
          unitPrice: 10000,
          discount: 0,
          taxRate: 18
        }
      ]);
      fetchInvoices();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to create invoice');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Record Payment
  const openPaymentModal = (invoice: IInvoiceItemRecord) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balanceDue > 0 ? invoice.balanceDue : 0);
    setPaymentRef(`UTR-${Date.now().toString().slice(-6)}`);
    setPaymentNotes(`Payment settlement for Invoice ${invoice.invoiceNumber}`);
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !businessId) return;

    if (paymentAmount <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      return;
    }

    if (paymentAmount > selectedInvoice.balanceDue) {
      setErrorMsg(`Payment amount cannot exceed outstanding balance of ₹${selectedInvoice.balanceDue.toLocaleString()}`);
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg('');

      await financeService.recordPayment(businessId, {
        invoiceId: selectedInvoice._id,
        customerId: selectedInvoice.customerId,
        amount: Number(paymentAmount),
        paymentDate,
        paymentMethod,
        referenceNumber: paymentRef || `REC-${Date.now()}`,
        notes: paymentNotes
      });

      setSuccessMsg(`Payment of ₹${paymentAmount.toLocaleString()} recorded. Invoice reconciled.`);
      setShowPaymentModal(false);
      fetchInvoices();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Preview / Printable Modal
  const openViewInvoice = (inv: IInvoiceItemRecord) => {
    setSelectedInvoice(inv);
    setShowViewModal(true);
  };

  const triggerPrint = () => {
    window.print();
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Partial
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Overdue
          </span>
        );
      case 'ISSUED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Issued
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 line-through border border-slate-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-blue-600" />
            Invoicing & Tax Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate GST-compliant tax invoices, reconcile partial & full customer payments, and preserve financial snapshots.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInvoices}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (customers.length > 0 && !selectedCustomerId) {
                setSelectedCustomerId(customers[0]._id);
              }
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Tax Invoice
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-rose-700">{errorMsg}</div>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-emerald-700">{successMsg}</div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Billed</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">₹{metrics.grandSum.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{totalInvoicesCount} total generated records</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Collected</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">₹{metrics.paidSum.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Verified payments received</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Outstanding Due</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">₹{metrics.balanceSum.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Pending customer settlement</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue Invoices</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{metrics.overdueCount}</p>
          <p className="text-xs text-slate-500 mt-1">Exceeded payment due date</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search invoice #, customer name, email..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {[
            { label: 'All', value: '' },
            { label: 'Issued', value: 'ISSUED' },
            { label: 'Partial', value: 'PARTIALLY_PAID' },
            { label: 'Paid', value: 'PAID' },
            { label: 'Overdue', value: 'OVERDUE' },
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Cancelled', value: 'CANCELLED' }
          ].map((pill) => (
            <button
              key={pill.label}
              onClick={() => {
                setStatusFilter(pill.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === pill.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Customer / Snapshot</th>
                <th className="px-5 py-3.5">Dates</th>
                <th className="px-5 py-3.5 text-right">Taxable</th>
                <th className="px-5 py-3.5 text-right">Grand Total</th>
                <th className="px-5 py-3.5 text-center">Settlement Status</th>
                <th className="px-5 py-3.5 text-center">Supply Type</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-600 font-medium">No invoices found matching criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Generate your first tax invoice using the button above.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const percentPaid = inv.grandTotal > 0 ? Math.min(100, Math.round((inv.amountPaid / inv.grandTotal) * 100)) : 0;
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice Number */}
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span>{inv.invoiceNumber}</span>
                            {inv.salesOrderId && (
                              <div className="text-[10px] text-slate-400">SO Linked</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Customer Snapshot */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {inv.customerSnapshot?.name || inv.customerName || 'Customer'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {inv.customerSnapshot?.companyName ? `${inv.customerSnapshot.companyName} • ` : ''}
                          {inv.customerSnapshot?.email || inv.customerEmail}
                        </div>
                        {inv.customerSnapshot?.gstin && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            GSTIN: {inv.customerSnapshot.gstin}
                          </div>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-800">
                          <span className="text-slate-400">Inv: </span>
                          {new Date(inv.invoiceDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-800 mt-0.5">
                          <span className="text-slate-400">Due: </span>
                          <span className={new Date(inv.dueDate) < new Date() && inv.balanceDue > 0 ? 'text-rose-600 font-medium' : ''}>
                            {new Date(inv.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Taxable Amount */}
                      <td className="px-5 py-4 text-right font-medium text-slate-700 whitespace-nowrap">
                        ₹{inv.taxableAmount.toLocaleString()}
                      </td>

                      {/* Grand Total & Balance */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900">₹{inv.grandTotal.toLocaleString()}</div>
                        {inv.balanceDue > 0 ? (
                          <div className="text-xs text-rose-600 font-medium">
                            Due: ₹{inv.balanceDue.toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-xs text-emerald-600 font-medium">Fully Settled</div>
                        )}
                      </td>

                      {/* Settlement & Progress */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="inline-block text-left">
                          {renderStatusBadge(inv.status)}
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                percentPaid === 100 ? 'bg-emerald-500' : percentPaid > 0 ? 'bg-amber-500' : 'bg-slate-300'
                              }`}
                              style={{ width: `${percentPaid}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Intra / Inter State Badge */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {inv.isInterState ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Inter-State (IGST)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            Intra (CGST+SGST)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openViewInvoice(inv)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View & Print Official Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.balanceDue > 0 && (
                            <button
                              onClick={() => openPaymentModal(inv)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                              title="Record Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page {page} of {totalPages} ({totalInvoicesCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-medium disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-medium disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================================
          MODAL 1: CREATE TAX INVOICE WITH LIVE GST BREAKDOWN
          ============================================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create Tax Invoice</h3>
                  <p className="text-xs text-slate-500">
                    Indian GST compliant invoice with automatic state-based tax split & immutable snapshot.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-6">
              {/* Customer Selector & Supply Indicator */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Customer *
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ''} — {c.address?.state || 'Maharashtra'}
                      </option>
                    ))}
                  </select>
                  {selectedCustomerObj && (
                    <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                      <p>
                        <span className="font-medium text-slate-700">Billing Address: </span>
                        {selectedCustomerObj.address?.street}, {selectedCustomerObj.address?.city},{' '}
                        {selectedCustomerObj.address?.state} - {selectedCustomerObj.address?.postalCode}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">GSTIN: </span>
                        {selectedCustomerObj.gstin || 'Not registered / Consumer'}
                      </p>
                    </div>
                  )}
                </div>

                {/* GST Place of Supply Determination */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Supply Classification
                    </span>
                    <div className="mt-1">
                      {isInterStateSupply ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                          Inter-State Supply (IGST 100%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-sky-100 text-sky-800">
                          Intra-State Supply (CGST 50% + SGST 50%)
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Seller: <span className="font-semibold">{activeBusiness?.address?.state || 'Maharashtra'}</span>
                    <br />
                    Buyer: <span className="font-semibold">{selectedCustomerObj?.address?.state || 'Maharashtra'}</span>
                  </p>
                </div>
              </div>

              {/* Dates & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Due Date *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g. Net 15, Due Upon Receipt"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Dynamic Line Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Products & Services Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Line Item
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 font-semibold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5 w-1/4">Product / Item</th>
                        <th className="px-2 py-2.5 w-20">HSN/SAC</th>
                        <th className="px-2 py-2.5 w-16">Unit</th>
                        <th className="px-2 py-2.5 w-16 text-right">Qty</th>
                        <th className="px-2 py-2.5 w-24 text-right">Rate (₹)</th>
                        <th className="px-2 py-2.5 w-20 text-right">Disc (₹)</th>
                        <th className="px-2 py-2.5 w-20 text-center">Tax %</th>
                        <th className="px-3 py-2.5 text-right w-24">Taxable</th>
                        <th className="px-2 py-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {formItems.map((item, index) => {
                        const lineGross = item.quantity * item.unitPrice;
                        const lineTaxable = Math.max(0, lineGross - (item.discount || 0));

                        return (
                          <tr key={index} className="align-top">
                            {/* Product Name & Description */}
                            <td className="p-2 space-y-1">
                              {products.length > 0 && (
                                <select
                                  value={item.productId || ''}
                                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                  className="w-full text-xs p-1 border border-slate-200 rounded bg-slate-50 text-slate-700 mb-1"
                                >
                                  <option value="">-- Choose from Catalog or Type Below --</option>
                                  {products.map((p) => (
                                    <option key={p._id} value={p._id}>
                                      {p.name} (₹{p.price || p.sellingPrice || p.cost || 0})
                                    </option>
                                  ))}
                                </select>
                              )}
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                placeholder="Item / Service Name"
                                required
                                className="w-full p-1.5 border border-slate-300 rounded text-xs text-slate-900"
                              />
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                placeholder="Brief description (optional)"
                                className="w-full p-1 border border-slate-200 rounded text-[11px] text-slate-500"
                              />
                            </td>

                            {/* HSN/SAC */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.hsnSacCode}
                                onChange={(e) => handleItemChange(index, 'hsnSacCode', e.target.value)}
                                placeholder="9983"
                                className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                              />
                            </td>

                            {/* Unit */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                placeholder="pcs"
                                className="w-full p-1.5 border border-slate-300 rounded text-xs"
                              />
                            </td>

                            {/* Qty */}
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                className="w-full p-1.5 border border-slate-300 rounded text-xs text-right"
                              />
                            </td>

                            {/* Unit Price */}
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                className="w-full p-1.5 border border-slate-300 rounded text-xs text-right font-medium"
                              />
                            </td>

                            {/* Discount */}
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.discount}
                                onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                                className="w-full p-1.5 border border-slate-300 rounded text-xs text-right text-rose-600"
                              />
                            </td>

                            {/* Tax Rate */}
                            <td className="p-2">
                              <select
                                value={item.taxRate}
                                onChange={(e) => handleItemChange(index, 'taxRate', Number(e.target.value))}
                                className="w-full p-1.5 border border-slate-300 rounded text-xs"
                              >
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                              </select>
                            </td>

                            {/* Line Taxable */}
                            <td className="p-2 text-right font-semibold text-slate-800">
                              ₹{lineTaxable.toLocaleString()}
                            </td>

                            {/* Remove button */}
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Extra Charges & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Shipping / Logistics Charges (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={shippingCharges}
                      onChange={(e) => setShippingCharges(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Other / Handling Charges (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={otherCharges}
                      onChange={(e) => setOtherCharges(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Customer Notes
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Terms & Conditions
                    </label>
                    <textarea
                      rows={2}
                      value={termsAndConditions}
                      onChange={(e) => setTermsAndConditions(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                {/* Live Financial Breakdown Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1.5">
                    Live Calculation & Tax Breakdown
                  </h5>
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Subtotal:</span>
                    <span className="font-medium text-slate-800">₹{computedInvoiceSummary.subtotal.toLocaleString()}</span>
                  </div>
                  {computedInvoiceSummary.totalDiscount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Total Discount:</span>
                      <span className="font-medium">- ₹{computedInvoiceSummary.totalDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700 font-semibold pt-1 border-t border-slate-200">
                    <span>Taxable Turnover:</span>
                    <span>₹{computedInvoiceSummary.taxableAmount.toLocaleString()}</span>
                  </div>

                  {isInterStateSupply ? (
                    <div className="flex justify-between text-purple-700 bg-purple-50 p-2 rounded">
                      <span>Integrated GST (IGST):</span>
                      <span className="font-bold">₹{computedInvoiceSummary.igstTotal.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="space-y-1 bg-sky-50 p-2 rounded text-sky-800">
                      <div className="flex justify-between">
                        <span>Central GST (CGST 50%):</span>
                        <span className="font-bold">₹{computedInvoiceSummary.cgstTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State GST (SGST 50%):</span>
                        <span className="font-bold">₹{computedInvoiceSummary.sgstTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {shippingCharges > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping Charges:</span>
                      <span>₹{shippingCharges.toLocaleString()}</span>
                    </div>
                  )}
                  {otherCharges > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Other Charges:</span>
                      <span>₹{otherCharges.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                    <span>Invoice Grand Total:</span>
                    <span className="text-blue-600 text-base">₹{computedInvoiceSummary.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs disabled:opacity-50"
                >
                  {actionLoading ? 'Generating...' : 'Issue & Lock Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================
          MODAL 2: RECORD PAYMENT (PARTIAL OR FULL RECONCILIATION)
          ============================================================================ */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
                  <p className="text-xs text-slate-500">Invoice: {selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Financial Snapshot in payment modal */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Grand Total:</span>
                <span className="font-semibold text-slate-900">₹{selectedInvoice.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Already Paid:</span>
                <span className="font-semibold text-emerald-600">₹{selectedInvoice.amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                <span>Remaining Balance Due:</span>
                <span className="text-rose-600">₹{selectedInvoice.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  max={selectedInvoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Enter partial or full amount</span>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(selectedInvoice.balanceDue)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Pay Full (₹{selectedInvoice.balanceDue.toLocaleString()})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Transaction / UTR Reference # *
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  required
                  placeholder="e.g. UTR-982348234"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Settlement Date *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reconciliation Notes
                </label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================
          MODAL 3: OFFICIAL TAX INVOICE PRINT & DETAIL VIEW
          ============================================================================ */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Top Bar with Print & Close */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">
                  Tax Invoice Document — {selectedInvoice.invoiceNumber}
                </span>
                {renderStatusBadge(selectedInvoice.status)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerPrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Paper */}
            <div className="p-8 space-y-6 text-slate-800" id="printable-invoice">
              {/* Header: Company & Tax Invoice Tag */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                      BN
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        {selectedInvoice.businessSnapshot?.name || activeBusiness?.name || 'BizNexus Enterprise'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {selectedInvoice.businessSnapshot?.legalName || 'Authorized SaaS Operating Entity'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mt-3 space-y-0.5">
                    <p>{selectedInvoice.businessSnapshot?.address?.street || 'Corporate Tech Park, Central Tower'}</p>
                    <p>
                      {selectedInvoice.businessSnapshot?.address?.city || 'Mumbai'},{' '}
                      {selectedInvoice.businessSnapshot?.address?.state || 'Maharashtra'} -{' '}
                      {selectedInvoice.businessSnapshot?.address?.postalCode || '400001'}
                    </p>
                    <p>Email: {selectedInvoice.businessSnapshot?.email || activeBusiness?.businessEmail || activeBusiness?.contactEmail || 'billing@biznexus.com'}</p>
                    <p className="font-mono font-semibold text-slate-800">
                      GSTIN: {selectedInvoice.businessSnapshot?.gstin || activeBusiness?.gstin || '27AAACB2234K1Z1'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-slate-100 text-slate-900 font-bold px-3 py-1 rounded text-sm uppercase tracking-wider mb-2">
                    Tax Invoice
                  </div>
                  <p className="text-xs text-slate-400">Original for Recipient</p>
                  <div className="mt-3 text-xs space-y-1">
                    <p>
                      <span className="text-slate-400">Invoice No: </span>
                      <span className="font-bold font-mono text-slate-900 text-sm">
                        {selectedInvoice.invoiceNumber}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Invoice Date: </span>
                      <span className="font-medium text-slate-800">
                        {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Due Date: </span>
                      <span className="font-medium text-slate-800">
                        {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Payment Terms: </span>
                      <span className="font-medium text-slate-800">
                        {selectedInvoice.paymentTerms || 'Net 15 Days'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill To Customer Information */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Billed To (Customer Snapshot):
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedInvoice.customerSnapshot?.name || selectedInvoice.customerName}
                  </p>
                  {selectedInvoice.customerSnapshot?.companyName && (
                    <p className="text-slate-600 font-medium">{selectedInvoice.customerSnapshot.companyName}</p>
                  )}
                  <p className="text-slate-500 mt-1">
                    {selectedInvoice.customerSnapshot?.address?.street ? (
                      <>
                        {selectedInvoice.customerSnapshot.address.street}, {selectedInvoice.customerSnapshot.address.city}
                        <br />
                        {selectedInvoice.customerSnapshot.address.state} -{' '}
                        {selectedInvoice.customerSnapshot.address.postalCode}
                      </>
                    ) : (
                      'Address on file'
                    )}
                  </p>
                  <p className="text-slate-500 mt-1">
                    Email: {selectedInvoice.customerSnapshot?.email || selectedInvoice.customerEmail}
                  </p>
                  <p className="font-mono font-semibold text-slate-800 mt-1">
                    GSTIN: {selectedInvoice.customerSnapshot?.gstin || 'Unregistered Buyer'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Place of Supply & Tax Mode:
                  </span>
                  <div className="mt-1">
                    {selectedInvoice.isInterState ? (
                      <div className="space-y-1">
                        <span className="inline-block bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded text-xs">
                          Inter-State (IGST)
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Destination: {selectedInvoice.customerSnapshot?.address?.state || 'Other State'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-block bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded text-xs">
                          Intra-State (CGST + SGST)
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Destination: {selectedInvoice.businessSnapshot?.address?.state || 'Maharashtra'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-[11px] text-slate-500 space-y-0.5">
                    <p>Reverse Charge: <span className="font-semibold text-slate-800">NO</span></p>
                    <p>Electronic Reference: <span className="font-mono text-slate-800">{selectedInvoice._id}</span></p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold uppercase text-slate-600 border-b border-slate-300">
                    <tr>
                      <th className="px-3 py-3 w-8 text-center">#</th>
                      <th className="px-3 py-3">Description</th>
                      <th className="px-2 py-3 text-center">HSN/SAC</th>
                      <th className="px-2 py-3 text-right">Qty</th>
                      <th className="px-3 py-3 text-right">Rate</th>
                      <th className="px-3 py-3 text-right">Discount</th>
                      <th className="px-3 py-3 text-right">Taxable</th>
                      <th className="px-2 py-3 text-center">GST %</th>
                      <th className="px-3 py-3 text-right">Tax Amt</th>
                      <th className="px-3 py-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items?.map((item: IInvoiceLineItem, i: number) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 text-center text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {item.description && <p className="text-[11px] text-slate-500">{item.description}</p>}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-slate-600">{item.hsnSacCode || '-'}</td>
                        <td className="px-2 py-2.5 text-right font-medium">
                          {item.quantity} {item.unit || ''}
                        </td>
                        <td className="px-3 py-2.5 text-right">₹{item.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right text-rose-600">
                          {item.discount > 0 ? `-₹${item.discount.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-800">
                          ₹{item.taxableAmount.toLocaleString()}
                        </td>
                        <td className="px-2 py-2.5 text-center font-semibold text-slate-700">{item.taxRate}%</td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                          ₹{item.totalTaxAmount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                          ₹{item.lineTotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Breakdown & Totals */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="text-xs text-slate-600 space-y-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Customer Notes & Instructions
                    </span>
                    <p className="text-xs text-slate-600 mt-1">{selectedInvoice.notes || 'None provided'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Terms & Conditions
                    </span>
                    <p className="text-[11px] text-slate-500 whitespace-pre-line mt-1">
                      {selectedInvoice.termsAndConditions || 'Standard enterprise supply terms apply.'}
                    </p>
                  </div>
                </div>

                {/* Calculation Summary Table */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span className="font-semibold text-slate-900">₹{selectedInvoice.taxableAmount.toLocaleString()}</span>
                  </div>

                  {selectedInvoice.isInterState ? (
                    <div className="flex justify-between text-purple-700 font-medium">
                      <span>Integrated GST (IGST):</span>
                      <span>₹{selectedInvoice.igstTotal.toLocaleString()}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sky-700 font-medium">
                        <span>Central GST (CGST):</span>
                        <span>₹{selectedInvoice.cgstTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sky-700 font-medium">
                        <span>State GST (SGST):</span>
                        <span>₹{selectedInvoice.sgstTotal.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                  {selectedInvoice.shippingCharges > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping / Logistics:</span>
                      <span>₹{selectedInvoice.shippingCharges.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvoice.otherCharges > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Other Charges:</span>
                      <span>₹{selectedInvoice.otherCharges.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-300 pt-2">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">₹{selectedInvoice.grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                    <span>Amount Paid:</span>
                    <span>₹{selectedInvoice.amountPaid.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-rose-600 border-t border-slate-200 pt-1">
                    <span>Balance Payable:</span>
                    <span>₹{selectedInvoice.balanceDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Footer */}
              <div className="grid grid-cols-2 gap-6 pt-10 border-t border-slate-300 items-end text-xs">
                <div className="text-slate-400">
                  <p>This is a computer-generated GST tax invoice.</p>
                  <p>BizNexus Multi-Tenant Financial Subsystem</p>
                </div>
                <div className="text-right">
                  <div className="w-48 border-b border-slate-400 ml-auto pb-1 mb-1"></div>
                  <span className="font-bold text-slate-800">Authorized Signatory</span>
                  <p className="text-[10px] text-slate-500">
                    For {selectedInvoice.businessSnapshot?.name || activeBusiness?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicingManagementPage;
