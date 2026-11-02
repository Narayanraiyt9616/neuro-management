import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import customerPortalService from '../../services/customerPortalService';
import {
  ICustomerPortalStats,
  ISupportTicketItem,
  ICreateTicketInput,
  TicketCategory
} from '../../types';
import {
  ShoppingBag,
  Receipt,
  Download,
  CheckCircle2,
  Send,
  User,
  CreditCard,
  FileCheck,
  FileX,
  MessageSquare,
  Clock,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Plus,
  ExternalLink,
  X
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  // Active Tab: 'OVERVIEW' | 'ORDERS' | 'INVOICES' | 'QUOTES' | 'TICKETS' | 'PROFILE'
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORDERS' | 'INVOICES' | 'QUOTES' | 'TICKETS' | 'PROFILE'>('OVERVIEW');

  // Data States
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<ICustomerPortalStats | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<ISupportTicketItem[]>([]);

  // Selected Ticket for Conversation View
  const [selectedTicket, setSelectedTicket] = useState<ISupportTicketItem | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');

  // Modals
  const [showCreateTicketModal, setShowCreateTicketModal] = useState<boolean>(false);
  const [showPayInvoiceModal, setShowPayInvoiceModal] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'NET_BANKING'>('CREDIT_CARD');
  const [paymentReceipt, setPaymentReceipt] = useState<any | null>(null);

  // Forms
  const [newTicket, setNewTicket] = useState<ICreateTicketInput>({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM'
  });

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Load Portal Data
  const loadPortalData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, invoicesRes, ticketsRes] = await Promise.all([
        customerPortalService.getDashboardStats(),
        customerPortalService.getOrders(),
        customerPortalService.getInvoices(),
        customerPortalService.listTickets()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (invoicesRes.success) setInvoices(invoicesRes.data || []);
      if (ticketsRes.success) setTickets(ticketsRes.data || []);
    } catch (err: any) {
      notify(err.message || 'Failed to load customer portal telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  // 1. Pay Invoice Handler
  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const res = await customerPortalService.payInvoice(selectedInvoice._id, {
        paymentMethod,
        amount: Number(paymentAmount) || 0
      });

      if (res.success && res.data) {
        setPaymentReceipt(res.data.receipt);
        notify(`Invoice #${selectedInvoice.invoiceNumber} payment of $${paymentAmount} processed!`);
        loadPortalData();
      }
    } catch (err: any) {
      notify(err.message || 'Payment simulation failed', 'error');
    }
  };

  // 2. Decide Quote Handler
  const handleDecideQuote = async (quoteId: string, decision: 'ACCEPT' | 'DECLINE') => {
    try {
      const res = await customerPortalService.decideQuote(quoteId, decision);
      if (res.success) {
        notify(`Quotation proposal ${decision === 'ACCEPT' ? 'Accepted' : 'Declined'} successfully!`);
        loadPortalData();
      }
    } catch (err: any) {
      notify(err.message || 'Action failed', 'error');
    }
  };

  // 3. Create Ticket Handler
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await customerPortalService.createTicket(newTicket);
      if (res.success && res.data) {
        notify(`Support ticket ${res.data.ticketNumber} created!`);
        setShowCreateTicketModal(false);
        setNewTicket({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM' });
        loadPortalData();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to create ticket', 'error');
    }
  };

  // 4. Reply to Ticket
  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const res = await customerPortalService.replyTicket(selectedTicket._id, replyMessage.trim());
      if (res.success && res.data) {
        setSelectedTicket(res.data);
        setReplyMessage('');
        notify('Message posted to ticket thread');
        loadPortalData();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to send reply', 'error');
    }
  };

  // 5. Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await customerPortalService.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          postalCode: profileForm.postalCode,
          country: profileForm.country
        }
      });
      if (res.success) {
        notify('Client profile and billing address updated!');
      }
    } catch (err: any) {
      notify(err.message || 'Failed to update profile', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-slate-500 font-medium text-sm">Loading Client Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950 border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          {notification.text}
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Enterprise Client Portal</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Enterprise Account
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Welcome back, <span className="font-semibold text-white">{user?.name}</span> ({user?.email}) • Self-Service Hub
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateTicketModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Portal Overview', icon: ShoppingBag },
          { id: 'ORDERS', label: `My Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'INVOICES', label: `Invoices & Billing (${invoices.length})`, icon: Receipt },
          { id: 'QUOTES', label: 'Quotes & Proposals', icon: FileCheck },
          { id: 'TICKETS', label: `Helpdesk Tickets (${tickets.length})`, icon: MessageSquare },
          { id: 'PROFILE', label: 'Company Profile & Address', icon: User }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === id
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PORTAL OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Orders</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats?.activeOrders ?? 0}</span>
                <span className="text-xs text-slate-500">of {stats?.totalOrders ?? 0} total</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">Real-time fulfillment tracking</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Due</span>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">${(stats?.outstandingBalance ?? 0).toFixed(2)}</span>
                <span className="text-xs text-rose-600 font-semibold">Unpaid</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Online settlement available</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Lifetime Spend</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">${(stats?.totalSpent ?? 0).toFixed(2)}</span>
                <span className="text-xs text-emerald-600 font-semibold">Tier: Gold</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Verified transaction history</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Open Support Tickets</span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats?.openTicketsCount ?? 0}</span>
                <span className="text-xs text-indigo-600 font-semibold">Under SLA</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Dedicated support assistance</p>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Purchase Orders</h3>
                <p className="text-xs text-slate-500">Track current shipment and fulfillment status</p>
              </div>
              <button
                onClick={() => setActiveTab('ORDERS')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Order Ref</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Items Ordered</th>
                    <th className="py-3 px-6">Total Amount</th>
                    <th className="py-3 px-6">Payment</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 3).map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6 font-mono font-semibold text-blue-600">{ord.orderNumber}</td>
                      <td className="py-3 px-6 text-slate-600">{new Date(ord.orderDate || ord.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-slate-800">
                        {ord.items?.map((it: any) => `${it.productName || 'Item'} (${it.quantity}x)`).join(', ') || 'N/A'}
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-900">${(ord.totalAmount || 0).toFixed(2)}</td>
                      <td className="py-3 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {ord.paymentStatus || 'PAID'}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                          {ord.status || 'CONFIRMED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ORDERS */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Purchase Orders & Fulfillment History</h3>
            <p className="text-xs text-slate-500">Review past consignments, quantities, and proof of delivery</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Order #</th>
                  <th className="py-3.5 px-6">Order Date</th>
                  <th className="py-3.5 px-6">Product Consignment</th>
                  <th className="py-3.5 px-6">Subtotal</th>
                  <th className="py-3.5 px-6">Grand Total</th>
                  <th className="py-3.5 px-6">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-mono font-bold text-blue-600">{ord.orderNumber}</td>
                    <td className="py-4 px-6 text-slate-600">{new Date(ord.orderDate || ord.createdAt).toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {ord.items?.map((it: any, i: number) => (
                          <div key={i} className="text-slate-800">
                            <span className="font-semibold">{it.productName || 'Product'}</span> x{it.quantity} @ ${it.unitPrice}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">${(ord.subtotal || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">${(ord.totalAmount || 0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {ord.status || 'DELIVERED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVOICES & BILLING */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Statements & Tax Invoices</h3>
              <p className="text-xs text-slate-500">Pay outstanding balances online or download tax invoices</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Issue Date</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const isPaid = inv.status === 'PAID' || inv.paymentStatus === 'PAID';
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-4 px-6 text-slate-600">{new Date(inv.issueDate || inv.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-slate-600">{new Date(inv.dueDate || inv.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        ${(inv.grandTotal || inv.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isPaid ? 'PAID' : 'DUE / UNPAID'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!isPaid ? (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentAmount(inv.grandTotal || inv.totalAmount || 500);
                              setPaymentReceipt(null);
                              setShowPayInvoiceModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                          >
                            Pay Online
                          </button>
                        ) : (
                          <button
                            onClick={() => window.print()}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: QUOTES & PROPOSALS */}
      {activeTab === 'QUOTES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quotations & Proposals</h3>
            <p className="text-xs text-slate-500">Review pending contract estimates and accept or decline with notes</p>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Active Proposal #QT-2026-8812
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">Dedicated Bare-Metal Node & 24/7 SLA Pack</h4>
              </div>
              <span className="text-lg font-bold text-slate-900 font-mono">$4,800.00 / yr</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Scope of supply covers 64-Core AMD EPYC server, NVMe storage replication, automated failover router, and 99.99% uptime guarantee with priority engineer dispatch.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleDecideQuote('QT-2026-8812', 'ACCEPT')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                <span>Accept Proposal</span>
              </button>
              <button
                onClick={() => handleDecideQuote('QT-2026-8812', 'DECLINE')}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <FileX className="w-4 h-4" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HELPDESK & SUPPORT TICKETS */}
      {activeTab === 'TICKETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Support Requests</h3>
              <button
                onClick={() => setShowCreateTicketModal(true)}
                className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold"
                title="Create ticket"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {tickets.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No support tickets found.</p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedTicket?._id === t._id
                        ? 'bg-blue-50/60 border-blue-500 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-mono font-semibold text-slate-500">{t.ticketNumber}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold ${
                          t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{t.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ticket Message Thread */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs lg:col-span-2 flex flex-col justify-between min-h-[450px]">
            {selectedTicket ? (
              <>
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {selectedTicket.ticketNumber} • {selectedTicket.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{selectedTicket.title}</h3>
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      48h SLA
                    </span>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                  {selectedTicket.messages?.map((msg, i) => {
                    const isClient = msg.senderRole === 'CUSTOMER';
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                          <span className="font-semibold text-slate-700">{msg.senderName}</span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs max-w-md ${
                            isClient
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input Box */}
                <form onSubmit={handleReplyTicket} className="flex gap-2 border-t border-slate-100 pt-3">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply message..."
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                <HelpCircle className="w-10 h-10 mb-2 opacity-30 text-blue-500" />
                <p className="text-sm font-semibold text-slate-700">Select a support ticket</p>
                <p className="text-xs text-slate-400 mt-1">Review correspondence thread or submit a response</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: PROFILE & ADDRESSES */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <div className="border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-base font-bold text-slate-900">Company Billing & Shipping Coordinates</h3>
            <p className="text-xs text-slate-500">Keep delivery details accurate for automated dispatch</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Contact Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={profileForm.street}
                onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                placeholder="400 Innovation Way, Suite 800"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                  placeholder="Seattle"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                  placeholder="WA"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={profileForm.postalCode}
                  onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                  placeholder="98101"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Pay Invoice Simulation */}
      {showPayInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                {paymentReceipt ? 'Payment Successful' : `Pay Invoice #${selectedInvoice.invoiceNumber}`}
              </h3>
              <button onClick={() => { setShowPayInvoiceModal(false); setPaymentReceipt(null); }} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentReceipt ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-emerald-900">Payment Confirmed!</h4>
                  <p className="text-xs text-emerald-700 mt-1">Receipt Ref: <span className="font-mono font-bold">{paymentReceipt.receiptNumber || 'RCPT-ONLINE'}</span></p>
                  <p className="text-sm font-bold text-slate-900 mt-2">Amount Paid: ${paymentReceipt.amountPaid || paymentAmount}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowPayInvoiceModal(false); setPaymentReceipt(null); }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Close Receipt
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayInvoice} className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                  <span className="text-xs uppercase font-semibold text-slate-500">Amount Due</span>
                  <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
                    ${Number(paymentAmount).toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="CREDIT_CARD">Credit Card (Visa / Mastercard)</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="UPI">UPI Instant QR</option>
                    <option value="NET_BANKING">Net Banking Transfer</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Confirm & Process Payment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Create Support Ticket */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Submit Support Ticket
              </h3>
              <button onClick={() => setShowCreateTicketModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as TicketCategory })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                >
                  <option value="BILLING">Billing & Invoice Inquiry</option>
                  <option value="ORDER">Order & Consignment Tracking</option>
                  <option value="TECHNICAL">Technical & Infrastructure Help</option>
                  <option value="GENERAL">General Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Invoicing GST discrepancy query"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide complete details to help us resolve faster..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
