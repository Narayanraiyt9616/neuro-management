import React, { useState, useEffect, useId } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import hrService from '../../services/hrService';
import { IEmployee, IDepartment } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  Building,
  X,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

export const EmployeeManagementPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Generate unique IDs for form accessibility
  const fullNameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const designationId = useId();
  const departmentIdField = useId();
  const employmentTypeId = useId();
  const basicSalaryId = useId();
  const currencyId = useId();
  const joiningDateId = useId();
  const dateOfBirthId = useId();
  const statusId = useId();
  const emergencyNameId = useId();
  const emergencyRelationshipId = useId();
  const emergencyPhoneId = useId();
  const initialPasswordId = useId();
  const docTitleId = useId();
  const docUrlId = useId();
  const docFileTypeId = useId();

  // State
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDocModal, setShowDocModal] = useState<boolean>(false);

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    departmentId: '',
    employmentType: 'FULL_TIME',
    salary: { basicSalary: 50000, currency: 'INR' },
    joiningDate: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
    status: 'ACTIVE',
    address: { street: '', city: '', state: '', postalCode: '', country: 'India' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    profilePhoto: '',
    initialPassword: 'Welcome@123'
  });

  const [docFormData, setDocFormData] = useState({
    name: '',
    url: '',
    fileType: 'PDF'
  });

  const loadData = async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setError(null);

      const [empRes, deptRes] = await Promise.all([
        hrService.listEmployees(businessId, {
          search,
          departmentId: departmentFilter,
          status: statusFilter,
          employmentType: typeFilter
        }),
        hrService.listDepartments(businessId)
      ]);

      setEmployees(empRes.employees);
      setDepartments(deptRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId, search, departmentFilter, statusFilter, typeFilter]);

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      designation: '',
      departmentId: departments[0]?._id || '',
      employmentType: 'FULL_TIME',
      salary: { basicSalary: 50000, currency: 'INR' },
      joiningDate: new Date().toISOString().split('T')[0],
      dateOfBirth: '1995-01-01',
      status: 'ACTIVE',
      address: { street: '', city: '', state: '', postalCode: '', country: 'India' },
      emergencyContact: { name: '', relationship: '', phone: '' },
      profilePhoto: '',
      initialPassword: 'Welcome@123'
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);
      await hrService.createEmployee(businessId, formData);
      setSuccessMsg('Employee created successfully with portal login credentials!');
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (emp: IEmployee) => {
    setSelectedEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone || '',
      designation: emp.designation,
      departmentId: emp.departmentId || '',
      employmentType: emp.employmentType,
      salary: {
        basicSalary: emp.salary?.basicSalary || 0,
        currency: emp.salary?.currency || 'INR'
      },
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toISOString().split('T')[0] : '',
      status: emp.status,
      address: emp.address || { street: '', city: '', state: '', postalCode: '', country: 'India' },
      emergencyContact: emp.emergencyContact || { name: '', relationship: '', phone: '' },
      profilePhoto: emp.profilePhoto || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      setActionLoading(true);
      setError(null);
      await hrService.updateEmployee(businessId, selectedEmployee._id, formData);
      setSuccessMsg('Employee profile updated successfully.');
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenView = async (emp: IEmployee) => {
    try {
      setActionLoading(true);
      const fullDetails = await hrService.getEmployeeById(businessId, emp._id);
      setSelectedEmployee(fullDetails);
      setShowViewModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch details');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (emp: IEmployee) => {
    const nextStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setActionLoading(true);
      await hrService.toggleEmployeeStatus(businessId, emp._id, nextStatus);
      setSuccessMsg(`Employee marked as ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDelete = (emp: IEmployee) => {
    setSelectedEmployee(emp);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      setActionLoading(true);
      setError(null);
      await hrService.deleteEmployee(businessId, selectedEmployee._id);
      setSuccessMsg('Employee removed successfully.');
      setShowDeleteModal(false);
      loadData();
    } catch (err: any) {
      // Safeguard error response directly shown
      setError(err.message || 'Delete operation failed');
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      setActionLoading(true);
      await hrService.uploadDocument(businessId, selectedEmployee._id, docFormData);
      setSuccessMsg('Document successfully uploaded to employee dossier.');
      setShowDocModal(false);
      setDocFormData({ name: '', url: '', fileType: 'PDF' });
      // Refresh view modal data
      const fullDetails = await hrService.getEmployeeById(businessId, selectedEmployee._id);
      setSelectedEmployee(fullDetails);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Document upload failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await hrService.exportEmployeesCSV(businessId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Employees_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Export failed: ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="warning">Inactive</Badge>;
      case 'SUSPENDED':
        return <Badge variant="danger">Suspended</Badge>;
      case 'TERMINATED':
        return <Badge variant="neutral">Terminated</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce & Employee Management</h1>
              <p className="text-sm text-slate-500">
                Manage all {employees.length} personnel profiles, roles, salary structures, and credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" icon={UserPlus} onClick={handleOpenAdd}>
            Add Employee
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card padded={false} className="border border-slate-200">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Employment Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Designation & Dept</th>
                <th className="px-6 py-3.5">Type & Salary</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading employee records...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No employees matching the selected criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                          {emp.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{emp.fullName}</div>
                          <div className="text-xs text-slate-500">{emp.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{emp.designation}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {emp.departmentName || 'General'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {emp.salary?.basicSalary?.toLocaleString()} {emp.salary?.currency || 'INR'}
                      </div>
                      <div className="text-xs text-slate-500">{emp.employmentType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-800 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {emp.email}
                      </div>
                      {emp.phone && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {emp.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(emp.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(emp)}
                          title="View Dossier"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Employee"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          title={emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-md transition-colors ${
                            emp.status === 'ACTIVE'
                              ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {emp.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenDelete(emp)}
                          title="Delete Employee"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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
      </Card>

      {/* ====================================================================== */}
      {/* ADD EMPLOYEE MODAL (14 REQUIRED FIELDS) */}
      {/* ====================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add New Personnel</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete the 14 employee attributes to onboard and auto-provision system credentials.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 overflow-y-auto space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Identity & Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={fullNameId} className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      id={fullNameId}
                      required
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={emailId} className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
                    <input
                      id={emailId}
                      required
                      type="email"
                      placeholder="john.doe@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={phoneId} className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      id={phoneId}
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={dateOfBirthId} className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      id={dateOfBirthId}
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Department & Employment Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Department & Role</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={designationId} className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                    <input
                      id={designationId}
                      required
                      type="text"
                      placeholder="e.g. Lead Software Architect"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={departmentIdField} className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      id={departmentIdField}
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={employmentTypeId} className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                    <select
                      id={employmentTypeId}
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={joiningDateId} className="block text-xs font-semibold text-slate-700 mb-1">Joining Date *</label>
                    <input
                      id={joiningDateId}
                      required
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Salary & Compensation */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">3. Compensation Package</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={basicSalaryId} className="block text-xs font-semibold text-slate-700 mb-1">Basic Monthly Salary *</label>
                    <input
                      id={basicSalaryId}
                      required
                      type="number"
                      min={0}
                      value={formData.salary.basicSalary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: { ...formData.salary, basicSalary: Number(e.target.value) }
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={currencyId} className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                    <select
                      id={currencyId}
                      value={formData.salary.currency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: { ...formData.salary, currency: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">4. Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={emergencyNameId} className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                    <input
                      id={emergencyNameId}
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.emergencyContact.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={emergencyRelationshipId} className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                    <input
                      id={emergencyRelationshipId}
                      type="text"
                      placeholder="Spouse / Parent / Sibling"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={emergencyPhoneId} className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
                    <input
                      id={emergencyPhoneId}
                      type="text"
                      placeholder="+1 (555) 999-9999"
                      value={formData.emergencyContact.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Password for Portal */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">5. Portal Provisioning</h4>
                <div>
                  <label htmlFor={initialPasswordId} className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
                  <input
                    id={initialPasswordId}
                    type="text"
                    value={formData.initialPassword}
                    onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    The employee can sign into BizNexus with this temporary password and their official email.
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowAddModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} type="submit">
                  Complete Onboarding
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* EDIT EMPLOYEE MODAL */}
      {/* ====================================================================== */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Employee Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedEmployee.employeeId}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`edit-${fullNameId}`} className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    id={`edit-${fullNameId}`}
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor={`edit-${phoneId}`} className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    id={`edit-${phoneId}`}
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor={`edit-${designationId}`} className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    id={`edit-${designationId}`}
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor={`edit-${departmentIdField}`} className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    id={`edit-${departmentIdField}`}
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`edit-${basicSalaryId}`} className="block text-xs font-semibold text-slate-700 mb-1">Basic Monthly Salary</label>
                  <input
                    id={`edit-${basicSalaryId}`}
                    type="number"
                    value={formData.salary?.basicSalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary: { ...formData.salary, basicSalary: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor={`edit-${statusId}`} className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    id={`edit-${statusId}`}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowEditModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* VIEW DOSSIER MODAL WITH DOCUMENTS */}
      {/* ====================================================================== */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
                  {selectedEmployee.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedEmployee.fullName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 font-mono">{selectedEmployee.employeeId}</span>
                    <span className="text-slate-300">•</span>
                    {getStatusBadge(selectedEmployee.status)}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Department</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{selectedEmployee.departmentName || 'General'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Designation</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{selectedEmployee.designation}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Basic Pay</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {selectedEmployee.salary?.basicSalary?.toLocaleString()} {selectedEmployee.salary?.currency}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Joining Date</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Contact & Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Contacts</h4>
                  <div className="space-y-1.5 text-sm text-slate-700">
                    <div>
                      <span className="text-slate-400">Email:</span> {selectedEmployee.email}
                    </div>
                    <div>
                      <span className="text-slate-400">Phone:</span> {selectedEmployee.phone || 'None provided'}
                    </div>
                    <div>
                      <span className="text-slate-400">Address:</span>{' '}
                      {selectedEmployee.address?.city
                        ? `${selectedEmployee.address.street || ''}, ${selectedEmployee.address.city}, ${selectedEmployee.address.country}`
                        : 'None on record'}
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Emergency Contact</h4>
                  <div className="space-y-1.5 text-sm text-slate-700">
                    <div>
                      <span className="text-slate-400">Name:</span> {selectedEmployee.emergencyContact?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="text-slate-400">Relationship:</span>{' '}
                      {selectedEmployee.emergencyContact?.relationship || 'N/A'}
                    </div>
                    <div>
                      <span className="text-slate-400">Phone:</span> {selectedEmployee.emergencyContact?.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Structure Breakdown */}
              {selectedEmployee.salaryStructure && (
                <div className="p-4 border border-slate-200 rounded-lg bg-blue-50/30">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">Itemized Salary Structure</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-500">Basic Salary</div>
                      <div className="font-semibold text-slate-800">
                        {selectedEmployee.salaryStructure.basicSalary?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">HRA Allowance</div>
                      <div className="font-semibold text-slate-800">
                        {selectedEmployee.salaryStructure.allowances?.hra?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Provident Fund (PF)</div>
                      <div className="font-semibold text-slate-800">
                        {selectedEmployee.salaryStructure.deductions?.pf?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Tax Deductions</div>
                      <div className="font-semibold text-slate-800">
                        {selectedEmployee.salaryStructure.deductions?.tax?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Documents */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Documents Dossier</h4>
                  <Button variant="outline" size="sm" icon={UploadCloud} onClick={() => setShowDocModal(true)}>
                    Upload File
                  </Button>
                </div>

                {selectedEmployee.documents && selectedEmployee.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEmployee.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-slate-800">{doc.name}</span>
                          <span className="text-slate-400 font-mono uppercase text-[10px]">({doc.fileType})</span>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" /> View / Download
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                    No documents on record. Click &quot;Upload File&quot; to append identity verification or contract files.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <Button variant="outline" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* UPLOAD DOCUMENT MODAL */}
      {/* ====================================================================== */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Attach Employee Document</h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload metadata / file link to the personnel dossier.
            </p>

            <form onSubmit={handleUploadDoc} className="space-y-3">
              <div>
                <label htmlFor={docTitleId} className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  id={docTitleId}
                  required
                  type="text"
                  placeholder="e.g. Identity Proof / Contract Agreement"
                  value={docFormData.name}
                  onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor={docUrlId} className="block text-xs font-semibold text-slate-700 mb-1">Document URL / Storage Path *</label>
                <input
                  id={docUrlId}
                  required
                  type="text"
                  placeholder="https://storage.biznexus.io/docs/contract.pdf"
                  value={docFormData.url}
                  onChange={(e) => setDocFormData({ ...docFormData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor={docFileTypeId} className="block text-xs font-semibold text-slate-700 mb-1">File Type</label>
                <select
                  id={docFileTypeId}
                  value={docFormData.fileType}
                  onChange={(e) => setDocFormData({ ...docFormData, fileType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="IMAGE">Image / Scan</option>
                  <option value="ZIP">Archive</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowDocModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} type="submit">
                  Save Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* DELETE SAFEGUARD MODAL */}
      {/* ====================================================================== */}
      {showDeleteModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Employee Profile</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to permanently delete <strong>{selectedEmployee.fullName}</strong> ({selectedEmployee.employeeId})?
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs text-left mb-6">
              <strong>Safeguard Policy:</strong> If this employee possesses historical attendance records, leave requests, or generated payslips, deletion will be blocked to preserve regulatory compliance. In such cases, deactivate the employee instead.
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" loading={actionLoading} onClick={handleConfirmDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagementPage;
