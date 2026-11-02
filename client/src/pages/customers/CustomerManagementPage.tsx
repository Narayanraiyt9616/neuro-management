import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import crmService from '../../services/crmService';
import {
  ICustomerItem,
  CustomerTypeOption,
  CustomerStatusOption,
  ISalesActivity
} from '../../types';
import {
  Users,
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  MapPin,
  DollarSign,
  ShoppingBag,
  Send,
  X,
  AlertCircle,
  Clock
} from 'lucide-react';

export const CustomerManagementPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // State
  const [customers, setCustomers] = useState<ICustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewDrawer, setShowViewDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCommModal, setShowCommModal] = useState(false);

  // Selected item state
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomerItem | null>(null);
  const [timeline, setTimeline] = useState<ISalesActivity[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    customerType: 'BUSINESS' as CustomerTypeOption,
    status: 'ACTIVE' as CustomerStatusOption,
    notes: ''
  });

  const [commData, setCommData] = useState({
    type: 'EMAIL' as 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE',
    subject: '',
    body: ''
  });

  const [importCsvText, setImportCsvText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await crmService.listCustomers(businessId, {
        search: searchTerm,
        status: statusFilter,
        customerType: typeFilter,
        page,
        limit: 15
      });
      setCustomers(res.customers || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [businessId, searchTerm, statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const fetchTimeline = async (custId: string) => {
    try {
      setTimelineLoading(true);
      const res = await crmService.getCustomerTimeline(businessId, custId);
      setTimeline(res || []);
    } catch {
      setTimeline([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      companyName: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      customerType: 'BUSINESS',
      status: 'ACTIVE',
      notes: ''
    });
    setErrorMsg('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: ICustomerItem) => {
    setSelectedCustomer(c);
    setFormData({
      fullName: c.fullName || c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      companyName: c.companyName || '',
      street: c.address?.street || '',
      city: c.address?.city || '',
      state: c.address?.state || '',
      postalCode: c.address?.postalCode || '',
      country: c.address?.country || 'India',
      customerType: c.customerType || 'BUSINESS',
      status: c.status || 'ACTIVE',
      notes: c.notes || ''
    });
    setShowEditModal(true);
  };

  const handleOpenView = (c: ICustomerItem) => {
    setSelectedCustomer(c);
    setShowViewDrawer(true);
    fetchTimeline(c._id);
  };

  const handleOpenDelete = (c: ICustomerItem) => {
    setSelectedCustomer(c);
    setShowDeleteModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      setActionLoading(true);
      setErrorMsg('');

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        customerType: formData.customerType,
        status: formData.status,
        notes: formData.notes,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        }
      };

      if (showEditModal && selectedCustomer) {
        await crmService.updateCustomer(businessId, selectedCustomer._id, payload);
        setSuccessMsg('Customer updated successfully.');
        setShowEditModal(false);
      } else {
        await crmService.createCustomer(businessId, payload);
        setSuccessMsg('Customer created successfully.');
        setShowAddModal(false);
      }

      fetchCustomers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error saving customer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!businessId || !selectedCustomer) return;
    try {
      setActionLoading(true);
      setErrorMsg('');
      await crmService.deleteCustomer(businessId, selectedCustomer._id);
      setSuccessMsg(`Customer ${selectedCustomer.fullName || selectedCustomer.name} deleted.`);
      setShowDeleteModal(false);
      fetchCustomers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to delete customer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!businessId) return;
    try {
      const csv = await crmService.exportCustomersCSV(businessId);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg('Failed to export CSV: ' + (err.message || ''));
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !importCsvText.trim()) return;
    try {
      setActionLoading(true);
      const res = await crmService.importCustomers(businessId, { csv: importCsvText });
      setSuccessMsg(`Imported ${res?.importedCount || 0} customer records successfully.`);
      setShowImportModal(false);
      setImportCsvText('');
      fetchCustomers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Import failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !selectedCustomer) return;
    try {
      setActionLoading(true);
      await crmService.recordCommunication(businessId, {
        customerId: selectedCustomer._id,
        type: commData.type,
        subject: commData.subject,
        body: commData.body
      });
      setSuccessMsg(`Communication logged and ${commData.type === 'EMAIL' ? 'sent via email' : 'saved'}.`);
      setShowCommModal(false);
      setCommData({ type: 'EMAIL', subject: '', body: '' });
      fetchTimeline(selectedCustomer._id);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Communication failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">ACTIVE</span>;
      case 'INACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">INACTIVE</span>;
      case 'LEAD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">LEAD</span>;
      case 'BLOCKED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">BLOCKED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{s}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    const t = (type || 'BUSINESS').toUpperCase();
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
        {t}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Customer Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain client profiles, verify order histories, and track customer communication records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setImportCsvText('');
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            Import CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
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

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, company, or customer ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="LEAD">LEAD</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Customer Types</option>
              <option value="BUSINESS">Business</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="INDIVIDUAL">Individual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Orders</th>
                <th className="px-5 py-3.5 text-right">Total Spent</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent mb-2"></div>
                    <div>Loading verified customer records...</div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-slate-700">No customers found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {searchTerm || statusFilter || typeFilter
                        ? 'Try clearing your search filters.'
                        : 'Create your first customer profile to begin.'}
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{c.fullName || c.name}</div>
                      <div className="text-xs text-indigo-600 font-mono mt-0.5">{c.customerId}</div>
                      {c.companyName && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {c.companyName}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">{getTypeBadge(c.customerType)}</td>
                    <td className="px-5 py-4">{getStatusBadge(c.status)}</td>
                    <td className="px-5 py-4 text-right font-medium text-slate-800">
                      {c.ordersCount || 0}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      ${(c.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenView(c)}
                          title="View Profile & Timeline"
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Customer"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(c)}
                          title="Delete Customer"
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {page} of {totalPages} ({totalCount} total customers)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: ADD / EDIT CUSTOMER (10 Fields)
          ========================================================================= */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {showEditModal ? 'Edit Customer Information' : 'Add New Customer Profile'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="mt-4 space-y-4">
              {/* Row 1: Full Name & Company Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. John Doe / Global Acme"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 3: Customer Type & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BUSINESS">Business</option>
                    <option value="ENTERPRISE">Enterprise</option>
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="INDIVIDUAL">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="LEAD">LEAD</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Address Details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  Address Details
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="State / Region"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Postal / Zip Code"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Notes & Preferences
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Billing instructions, key account contacts, special agreements..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : showEditModal ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER: VIEW CUSTOMER PROFILE & TIMELINE
          ========================================================================= */}
      {showViewDrawer && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedCustomer.customerId}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedCustomer.fullName || selectedCustomer.name}
                </h2>
                {selectedCustomer.companyName && (
                  <p className="text-sm text-slate-500">{selectedCustomer.companyName}</p>
                )}
              </div>
              <button
                onClick={() => setShowViewDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  Total Orders
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {selectedCustomer.ordersCount || 0}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Total Spent
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  ${(selectedCustomer.totalSpent || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Contact & Status details */}
            <div className="space-y-3 bg-white border border-slate-200 p-4 rounded-xl text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-900">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-900">{selectedCustomer.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Customer Type:</span>
                <div>{getTypeBadge(selectedCustomer.customerType)}</div>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Account Status:</span>
                <div>{getStatusBadge(selectedCustomer.status)}</div>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="font-medium text-slate-900 text-right max-w-[260px]">
                  {[
                    selectedCustomer.address?.street,
                    selectedCustomer.address?.city,
                    selectedCustomer.address?.state,
                    selectedCustomer.address?.country
                  ]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedCustomer.notes && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-900">
                <span className="font-semibold block mb-1">Customer Notes:</span>
                {selectedCustomer.notes}
              </div>
            )}

            {/* Quick action: Log communication */}
            <div className="flex items-center justify-between pt-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Activity Timeline & Communications
              </h3>
              <button
                onClick={() => {
                  setCommData({ type: 'EMAIL', subject: '', body: '' });
                  setShowCommModal(true);
                }}
                className="text-xs font-semibold px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Log Interaction
              </button>
            </div>

            {/* Activity List */}
            <div className="space-y-3">
              {timelineLoading ? (
                <div className="text-xs text-slate-400 text-center py-4">Loading timeline...</div>
              ) : timeline.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                  No logged interactions yet. Use 'Log Interaction' to record calls, emails or notes.
                </div>
              ) : (
                timeline.map((act) => (
                  <div key={act._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{act.subject}</span>
                      <span className="text-slate-400">
                        {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600">{act.description}</p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                      {act.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SAFE DELETE CONFIRMATION
          ========================================================================= */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to remove customer{' '}
              <strong className="text-slate-900">
                {selectedCustomer.fullName || selectedCustomer.name}
              </strong>{' '}
              ({selectedCustomer.customerId})?
            </p>
            {selectedCustomer.ordersCount > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Safeguard Active:</strong> This customer has {selectedCustomer.ordersCount} existing orders.
                Deletion will be prevented by the server to preserve audit logs. You may change their status to BLOCKED instead.
              </div>
            )}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: IMPORT CSV
          ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Import Customers CSV
              </h3>
              <button onClick={() => setShowImportModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleImportSubmit} className="mt-4 space-y-3">
              <p className="text-xs text-slate-500">
                Paste your CSV content below. Header must follow:{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">
                  Customer ID,Full Name,Email,Phone,Company Name,Customer Type
                </code>
              </p>
              <textarea
                rows={8}
                required
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                placeholder={`Customer ID,Full Name,Email,Phone,Company Name,Customer Type\nCUST-2001,John Smith,john@smithcorp.com,+1 555-1111,Smith Corp,BUSINESS`}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              ></textarea>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Importing...' : 'Start Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RECORD COMMUNICATION
          ========================================================================= */}
      {showCommModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Record Customer Interaction
              </h3>
              <button onClick={() => setShowCommModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSendCommunication} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interaction Type
                </label>
                <select
                  value={commData.type}
                  onChange={(e) => setCommData({ ...commData, type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EMAIL">Verified Email (Dispatched to {selectedCustomer.email})</option>
                  <option value="CALL">Phone Call</option>
                  <option value="MEETING">Meeting</option>
                  <option value="NOTE">Internal Note</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={commData.subject}
                  onChange={(e) => setCommData({ ...commData, subject: e.target.value })}
                  placeholder="e.g. Contract Discussion / Follow-up"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={commData.body}
                  onChange={(e) => setCommData({ ...commData, body: e.target.value })}
                  placeholder="Notes, transcript, or email body text..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCommModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : commData.type === 'EMAIL' ? 'Send & Record Email' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;
