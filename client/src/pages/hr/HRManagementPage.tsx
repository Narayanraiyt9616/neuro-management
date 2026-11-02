import React, { useState, useEffect, useId } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import hrService from '../../services/hrService';
import {
  IDepartment,
  IAttendanceRecord,
  ILeaveRequest,
  ILeaveBalance,
  IJobOpening,
  IJobApplication,
  IPayrollRecord,
  IPayslip,
  INotificationItem,
  IHRReportsData,
  IEmployee
} from '../../types';
import Card, { CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  Briefcase,
  Building,
  Clock,
  CalendarCheck,
  DollarSign,
  FileBarChart,
  Bell,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  X,
  LogOut,
  LogIn,
  Check,
  FileSpreadsheet
} from 'lucide-react';

export const HRManagementPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const { user } = useAuth();
  const businessId = activeBusiness?._id || '';

  // Generate unique IDs for form accessibility
  const deptNameId = useId();
  const deptCodeId = useId();
  const deptManagerId = useId();
  const deptBudgetId = useId();
  const deptDescId = useId();
  const leaveTypeId = useId();
  const leaveStartDateId = useId();
  const leaveEndDateId = useId();
  const leaveReasonId = useId();
  const rejectionReasonId = useId();
  const casualQuotaId = useId();
  const sickQuotaId = useId();
  const earnedQuotaId = useId();
  const carryForwardId = useId();
  const jobTitleId = useId();
  const jobDeptId = useId();
  const jobTypeId = useId();
  const jobExpId = useId();
  const jobQualId = useId();
  const jobDescId = useId();
  const interviewDateId = useId();
  const interviewerNameId = useId();
  const interviewLinkId = useId();
  const interviewNotesId = useId();
  const payrollMonthId = useId();
  const payrollYearId = useId();
  const payrollNotesId = useId();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'departments' | 'attendance' | 'leaves' | 'recruitment' | 'payroll' | 'reports' | 'notifications'
  >('departments');

  // Loading & Alerts
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Data states
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [deptStats, setDeptStats] = useState<any>(null);
  const [employees, setEmployees] = useState<IEmployee[]>([]);

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<IAttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<IAttendanceRecord | null>(null);
  const [attendanceNotes] = useState<string>('');

  // Leaves state
  const [leaveRequests, setLeaveRequests] = useState<ILeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<ILeaveBalance | null>(null);

  // Recruitment state
  const [jobOpenings, setJobOpenings] = useState<IJobOpening[]>([]);
  const [jobApplications, setJobApplications] = useState<IJobApplication[]>([]);

  // Payroll state
  const [payrolls, setPayrolls] = useState<IPayrollRecord[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<{ payroll: IPayrollRecord; payslips: IPayslip[] } | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<IPayslip | null>(null);

  // Reports state
  const [reportsData, setReportsData] = useState<IHRReportsData | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);

  // Modals
  const [showDeptModal, setShowDeptModal] = useState<boolean>(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', managerId: '', budget: 0 });
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'CASUAL_LEAVE', startDate: '', endDate: '', reason: '' });

  const [showReviewLeaveModal, setShowReviewLeaveModal] = useState<boolean>(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [policyForm, setPolicyForm] = useState({ casualLeaveQuota: 12, sickLeaveQuota: 10, earnedLeaveQuota: 15, unpaidLeaveAllowed: true, carryForwardLimit: 5 });

  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [jobForm, setJobForm] = useState({
    departmentId: '',
    title: '',
    description: '',
    qualifications: 'TypeScript, React, Node.js',
    experienceYears: 2,
    salaryRange: { min: 60000, max: 90000, currency: 'INR' },
    employmentType: 'FULL_TIME',
    positionsCount: 1,
    status: 'ACTIVE'
  });

  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    interviewerName: user?.name || 'Hiring Manager',
    notes: 'Technical & architectural discussion',
    meetingLink: 'https://meet.google.com/abc-defg-hij'
  });

  const [showGeneratePayrollModal, setShowGeneratePayrollModal] = useState<boolean>(false);
  const [payrollForm, setPayrollForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    notes: 'Standard monthly salary run'
  });

  // Load Tab-specific Data
  const loadTabContent = async () => {
    if (!businessId) return;
    try {
      setError(null);

      // Always load core departments & employees for select boxes
      const [depts, emps] = await Promise.all([
        hrService.listDepartments(businessId),
        hrService.listEmployees(businessId, { limit: 100 })
      ]);
      setDepartments(depts);
      setEmployees(emps.employees);

      if (activeTab === 'departments') {
        const stats = await hrService.getDepartmentStatistics(businessId);
        setDeptStats(stats);
      } else if (activeTab === 'attendance') {
        const [attList, today] = await Promise.all([
          hrService.listAttendance(businessId),
          hrService.getTodayAttendance(businessId)
        ]);
        setAttendanceRecords(attList);
        setTodayAttendance(today);
      } else if (activeTab === 'leaves') {
        const [leaves] = await Promise.all([
          hrService.listLeaveRequests(businessId)
        ]);
        setLeaveRequests(leaves);
        if (emps.employees[0]) {
          const bal = await hrService.getEmployeeLeaveBalance(businessId, emps.employees[0]._id);
          setLeaveBalance(bal);
        }
      } else if (activeTab === 'recruitment') {
        const [jobs, apps] = await Promise.all([
          hrService.listJobOpenings(businessId),
          hrService.listApplications(businessId)
        ]);
        setJobOpenings(jobs);
        setJobApplications(apps);
      } else if (activeTab === 'payroll') {
        const payrollList = await hrService.listPayrolls(businessId);
        setPayrolls(payrollList);
      } else if (activeTab === 'reports') {
        const reports = await hrService.getHRReports(businessId);
        setReportsData(reports);
      } else if (activeTab === 'notifications') {
        const notifs = await hrService.getUserNotifications(businessId);
        setNotifications(notifs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load module data');
    }
  };

  useEffect(() => {
    loadTabContent();
  }, [businessId, activeTab]);

  // -------------------------------------------------------------
  // DEPARTMENTS HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddDept = () => {
    setEditingDeptId(null);
    setDeptForm({ name: '', code: '', description: '', managerId: '', budget: 50000 });
    setShowDeptModal(true);
  };

  const handleOpenEditDept = (dept: IDepartment) => {
    setEditingDeptId(dept._id);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      managerId: typeof dept.managerId === 'object' ? dept.managerId?._id : dept.managerId || '',
      budget: dept.budget || 0
    });
    setShowDeptModal(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);
      if (editingDeptId) {
        await hrService.updateDepartment(businessId, editingDeptId, deptForm);
        setSuccessMsg('Department updated successfully.');
      } else {
        await hrService.createDepartment(businessId, deptForm);
        setSuccessMsg('Department created successfully.');
      }
      setShowDeptModal(false);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDept = async (dept: IDepartment) => {
    if (!window.confirm(`Are you sure you want to delete department ${dept.name}?`)) return;
    try {
      setActionLoading(true);
      setError(null);
      await hrService.deleteDepartment(businessId, dept._id);
      setSuccessMsg(`Department ${dept.name} deleted successfully.`);
      loadTabContent();
    } catch (err: any) {
      // Safeguard error response shown directly
      setError(err.message || 'Failed to delete department');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ATTENDANCE HANDLERS
  // -------------------------------------------------------------
  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await hrService.checkIn(businessId, attendanceNotes);
      setTodayAttendance(res);
      setSuccessMsg(`Check-in recorded at ${new Date().toLocaleTimeString()} (Status: ${res.status})`);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await hrService.checkOut(businessId, attendanceNotes);
      setTodayAttendance(res);
      setSuccessMsg(`Check-out recorded at ${new Date().toLocaleTimeString()} (${res.workingHours} hrs worked)`);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // LEAVES HANDLERS
  // -------------------------------------------------------------
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);
      await hrService.applyLeave(businessId, leaveForm);
      setSuccessMsg('Leave request submitted successfully for approval.');
      setShowLeaveModal(false);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReviewLeave = (leaveId: string, action: 'APPROVE' | 'REJECT') => {
    setSelectedLeaveId(leaveId);
    setReviewAction(action);
    setRejectionReason('');
    setShowReviewLeaveModal(true);
  };

  const handleConfirmReviewLeave = async () => {
    if (!selectedLeaveId) return;
    try {
      setActionLoading(true);
      setError(null);
      await hrService.reviewLeave(businessId, selectedLeaveId, reviewAction, rejectionReason);
      setSuccessMsg(`Leave request marked as ${reviewAction}ED.`);
      setShowReviewLeaveModal(false);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Review failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrService.updateLeavePolicy(businessId, policyForm);
      setSuccessMsg('Leave policy quotas updated successfully.');
      setShowPolicyModal(false);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Failed to update leave policy');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RECRUITMENT HANDLERS
  // -------------------------------------------------------------
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);
      const qualArray = jobForm.qualifications.split(',').map((q) => q.trim()).filter(Boolean);
      await hrService.createJobOpening(businessId, {
        ...jobForm,
        qualifications: qualArray
      });
      setSuccessMsg('Job opening published successfully.');
      setShowJobModal(false);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Failed to create job opening');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    try {
      setActionLoading(true);
      await hrService.updateApplicationStatus(businessId, appId, status);
      setSuccessMsg(`Candidate application marked as ${status}.`);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;
    try {
      setActionLoading(true);
      await hrService.scheduleInterview(businessId, selectedAppId, interviewForm);
      setSuccessMsg('Interview scheduled and candidate notified.');
      setShowInterviewModal(false);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Scheduling failed');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // PAYROLL HANDLERS
  // -------------------------------------------------------------
  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);
      const res = await hrService.generateMonthlyPayroll(businessId, payrollForm);
      setSuccessMsg(`Monthly payroll for ${res.payroll.payrollPeriod} generated (${res.payroll.totalEmployees} employees, Net: ₹${res.payroll.totalNetSalary?.toLocaleString()})`);
      setShowGeneratePayrollModal(false);
      loadTabContent();
    } catch (err: any) {
      setError(err.message || 'Payroll generation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPayrollDetails = async (payrollId: string) => {
    try {
      setActionLoading(true);
      const details = await hrService.getPayrollDetails(businessId, payrollId);
      setSelectedPayroll(details);
    } catch (err: any) {
      setError(err.message || 'Failed to load payroll details');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPayrollPaid = async (payrollId: string) => {
    try {
      setActionLoading(true);
      await hrService.updatePayrollStatus(businessId, payrollId, 'PAID');
      setSuccessMsg('Payroll status marked as PAID and disbursement recorded.');
      loadTabContent();
      if (selectedPayroll) {
        handleViewPayrollDetails(payrollId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update payroll status');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // EXPORTS
  // -------------------------------------------------------------
  const handleExportReport = async (type: string) => {
    try {
      const blob = await hrService.exportReportCSV(businessId, type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HR_${type}_Report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Report export failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm shadow-blue-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise HR & Workforce Suite</h1>
            <p className="text-sm text-slate-500">
              Unified administration of departments, daily attendance, leaves, recruitment pipelines, and payroll.
            </p>
          </div>
        </div>

        {/* Global Notifications pill */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={FileSpreadsheet}
            onClick={() => handleExportReport('DEPARTMENT')}
            size="sm"
          >
            Export HR Data
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

      {/* 7 Modular Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-2 flex overflow-x-auto select-none shadow-sm">
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" /> Departments
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'attendance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" /> Attendance & Clock
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'leaves'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" /> Leave Management
        </button>
        <button
          onClick={() => setActiveTab('recruitment')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'recruitment'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Recruitment & Jobs
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'payroll'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Payroll & Payslips
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileBarChart className="w-4 h-4" /> 7 HR Reports
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: DEPARTMENTS */}
      {/* ==================================================================== */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          {deptStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card padded={false} className="p-4 bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Total Departments</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{deptStats.totalDepartments}</div>
              </Card>
              <Card padded={false} className="p-4 bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Active Units</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{deptStats.activeDepartments}</div>
              </Card>
              <Card padded={false} className="p-4 bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Assigned Employees</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{deptStats.totalEmployees}</div>
              </Card>
              <Card padded={false} className="p-4 bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Total Department Budget</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">₹{deptStats.totalBudget?.toLocaleString()}</div>
              </Card>
            </div>
          )}

          {/* Action Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Departments Directory</h2>
            <Button variant="primary" icon={Plus} size="sm" onClick={handleOpenAddDept}>
              Create Department
            </Button>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <Card key={dept._id} padded={false} className="border border-slate-200 bg-white hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {dept.code}
                    </span>
                    <Badge variant={dept.isActive ? 'success' : 'neutral'}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{dept.description || 'No description provided.'}</p>
                </div>

                <div className="p-5 bg-slate-50/50 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department Head:</span>
                    <span className="font-semibold text-slate-800">
                      {typeof dept.managerId === 'object' ? dept.managerId?.fullName : 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Headcount:</span>
                    <span className="font-semibold text-blue-600">{dept.employeeCount || 0} employees</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allocated Budget:</span>
                    <span className="font-semibold text-slate-800">₹{dept.budget?.toLocaleString() || 0}</span>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 bg-white flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditDept(dept)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Department"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDept(dept)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete Department (Safeguarded)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ATTENDANCE & TIME CLOCK */}
      {/* ==================================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Live Check-In / Check-Out Widget */}
          <Card padded={false} className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-lg border-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" /> Live Biometric Clock
                </div>
                <h3 className="text-2xl font-bold mt-1">Today&apos;s Attendance Status</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Server timestamped attendance with automated late arrival calculation and working hours tracking.
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                  <span>Server Date: {new Date().toISOString().split('T')[0]}</span>
                  <span>•</span>
                  <span>
                    Status:{' '}
                    <strong className="text-emerald-400">{todayAttendance?.status || 'NOT_CHECKED_IN'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {!todayAttendance ? (
                  <Button
                    variant="primary"
                    icon={LogIn}
                    loading={actionLoading}
                    onClick={handleCheckIn}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-sm font-bold shadow-lg"
                  >
                    Check In Now
                  </Button>
                ) : !todayAttendance.checkOut ? (
                  <Button
                    variant="primary"
                    icon={LogOut}
                    loading={actionLoading}
                    onClick={handleCheckOut}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 text-sm font-bold shadow-lg"
                  >
                    Check Out (Submitted {todayAttendance.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString() : ''})
                  </Button>
                ) : (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl text-center">
                    <div className="text-emerald-400 font-bold text-sm">Checked Out Today</div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Completed {todayAttendance.workingHours} hours worked
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Daily Attendance Records Table */}
          <Card padded={false} className="border border-slate-200">
            <CardHeader
              title="Attendance Log"
              subtitle="Daily employee clock-in and clock-out logs with duration and status."
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Check In</th>
                    <th className="px-6 py-3.5">Check Out</th>
                    <th className="px-6 py-3.5">Hours</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No attendance logs recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    attendanceRecords.map((att) => (
                      <tr key={att._id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {typeof att.employeeId === 'object' ? att.employeeId?.fullName : 'Staff'}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          {new Date(att.date).toISOString().split('T')[0]}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : '—'}
                          {att.lateMinutes > 0 && (
                            <span className="text-[10px] text-amber-600 block">+{att.lateMinutes}m late</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '—'}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                          {att.workingHours || 0} hrs
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              att.status === 'PRESENT'
                                ? 'success'
                                : att.status === 'LATE'
                                ? 'warning'
                                : att.status === 'ON_LEAVE'
                                ? 'info'
                                : 'neutral'
                            }
                          >
                            {att.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: LEAVE MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Leave Quota Balances */}
          {leaveBalance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card padded={false} className="p-4 bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Casual Leaves</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{leaveBalance.casual.remaining} days</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Quota: {leaveBalance.casual.quota} • Used: {leaveBalance.casual.used}</div>
              </Card>
              <Card padded={false} className="p-4 bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Sick Leaves</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{leaveBalance.sick.remaining} days</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Quota: {leaveBalance.sick.quota} • Used: {leaveBalance.sick.used}</div>
              </Card>
              <Card padded={false} className="p-4 bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Earned / Paid Leaves</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{leaveBalance.earned.remaining} days</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Quota: {leaveBalance.earned.quota} • Used: {leaveBalance.earned.used}</div>
              </Card>
              <Card padded={false} className="p-4 bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Unpaid Leaves</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">{leaveBalance.unpaid.used} taken</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Subject to payroll deduction</div>
              </Card>
            </div>
          )}

          {/* Action Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Leave Requests & Approvals</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPolicyModal(true)}>
                Configure Leave Policy
              </Button>
              <Button variant="primary" icon={Plus} size="sm" onClick={() => setShowLeaveModal(true)}>
                Apply for Leave
              </Button>
            </div>
          </div>

          {/* Leave Requests Table */}
          <Card padded={false} className="border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Leave Type</th>
                    <th className="px-6 py-3.5">Span</th>
                    <th className="px-6 py-3.5">Days</th>
                    <th className="px-6 py-3.5">Reason</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                        No leave applications submitted.
                      </td>
                    </tr>
                  ) : (
                    leaveRequests.map((lr) => (
                      <tr key={lr._id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {typeof lr.employeeId === 'object' ? lr.employeeId?.fullName : 'Staff Member'}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                          {lr.leaveType.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          {new Date(lr.startDate).toISOString().split('T')[0]} to{' '}
                          {new Date(lr.endDate).toISOString().split('T')[0]}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-blue-600">{lr.daysCount} d</td>
                        <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">{lr.reason}</td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              lr.status === 'APPROVED'
                                ? 'success'
                                : lr.status === 'REJECTED'
                                ? 'danger'
                                : lr.status === 'PENDING'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {lr.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {lr.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenReviewLeave(lr._id, 'APPROVE')}
                                className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenReviewLeave(lr._id, 'REJECT')}
                                className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: RECRUITMENT & JOBS */}
      {/* ==================================================================== */}
      {activeTab === 'recruitment' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Talent Acquisition & Open Positions</h2>
              <p className="text-xs text-slate-500">Manage career openings and applicant interviewing pipeline.</p>
            </div>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setShowJobModal(true)}>
              Post Job Opening
            </Button>
          </div>

          {/* Job Openings List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobOpenings.map((job) => (
              <Card key={job._id} padded={false} className="border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant={job.status === 'ACTIVE' || job.status === 'OPEN' ? 'success' : 'neutral'}>
                      {job.status}
                    </Badge>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{job.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{job.employmentType} • {job.experienceYears}+ years exp</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{job.applicationsCount || 0}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Applicants</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">{job.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Salary: ₹{job.salaryRange?.min?.toLocaleString()} - ₹{job.salaryRange?.max?.toLocaleString()}</span>
                  <span>{job.positionsCount} opening(s)</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Applicant Pipeline */}
          <Card padded={false} className="border border-slate-200 mt-6">
            <CardHeader title="Candidate Applications Pipeline" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Candidate</th>
                    <th className="px-6 py-3.5">Position</th>
                    <th className="px-6 py-3.5">Contact</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Pipeline Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {jobApplications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        No candidate applications registered yet.
                      </td>
                    </tr>
                  ) : (
                    jobApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-semibold text-slate-900">{app.candidateName}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-800">
                          {typeof app.jobOpeningId === 'object' ? app.jobOpeningId?.title : 'Position'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{app.candidateEmail}</td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              app.status === 'SELECTED'
                                ? 'success'
                                : app.status === 'REJECTED'
                                ? 'danger'
                                : app.status === 'INTERVIEW_SCHEDULED'
                                ? 'info'
                                : 'warning'
                            }
                          >
                            {app.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {app.status === 'APPLIED' && (
                              <button
                                onClick={() => handleUpdateAppStatus(app._id, 'SHORTLISTED')}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded"
                              >
                                Shortlist
                              </button>
                            )}
                            {app.status === 'SHORTLISTED' && (
                              <button
                                onClick={() => {
                                  setSelectedAppId(app._id);
                                  setShowInterviewModal(true);
                                }}
                                className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded"
                              >
                                Schedule Interview
                              </button>
                            )}
                            {app.status === 'INTERVIEW_SCHEDULED' && (
                              <button
                                onClick={() => handleUpdateAppStatus(app._id, 'SELECTED')}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded"
                              >
                                Select & Offer
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
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: PAYROLL & PAYSLIPS */}
      {/* ==================================================================== */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Automated Payroll System</h2>
              <p className="text-xs text-slate-500">
                Attendance and leave-integrated monthly salary processing with transparent deductions.
              </p>
            </div>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setShowGeneratePayrollModal(true)}>
              Run Monthly Payroll
            </Button>
          </div>

          {/* Payroll Cycles History */}
          <Card padded={false} className="border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Payroll Period</th>
                    <th className="px-6 py-3.5">Total Employees</th>
                    <th className="px-6 py-3.5">Gross Pay</th>
                    <th className="px-6 py-3.5">Total Deductions</th>
                    <th className="px-6 py-3.5">Net Disbursed</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payrolls.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                        No payroll runs on record. Click &quot;Run Monthly Payroll&quot; to generate payslips.
                      </td>
                    </tr>
                  ) : (
                    payrolls.map((pr) => (
                      <tr key={pr._id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{pr.payrollPeriod}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">{pr.totalEmployees} staff</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-800">
                          ₹{pr.totalGrossSalary?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-rose-600">
                          ₹{pr.totalDeductions?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-emerald-600">
                          ₹{pr.totalNetSalary?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={pr.status === 'PAID' ? 'success' : 'warning'}>{pr.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Eye}
                              onClick={() => handleViewPayrollDetails(pr._id)}
                            >
                              Inspect
                            </Button>
                            {pr.status !== 'PAID' && (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={Check}
                                onClick={() => handleMarkPayrollPaid(pr._id)}
                              >
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Itemized Payslips Modal Drawer */}
          {selectedPayroll && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Payroll Period {selectedPayroll.payroll.payrollPeriod}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPayroll.payslips.length} itemized payslips generated
                    </p>
                  </div>
                  <button onClick={() => setSelectedPayroll(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-100 text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="px-4 py-2">Employee</th>
                        <th className="px-4 py-2">Basic</th>
                        <th className="px-4 py-2">Allowances</th>
                        <th className="px-4 py-2">Deductions</th>
                        <th className="px-4 py-2">Net Salary</th>
                        <th className="px-4 py-2 text-right">Payslip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {selectedPayroll.payslips.map((ps) => (
                        <tr key={ps._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900">{ps.employeeName}</td>
                          <td className="px-4 py-3">₹{ps.basicSalary?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-emerald-600">
                            ₹{(ps.grossSalary - ps.basicSalary)?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-rose-600">
                            ₹{(ps.grossSalary - ps.netSalary)?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">₹{ps.netSalary?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedPayslip(ps)}
                              className="text-blue-600 font-semibold hover:underline"
                            >
                              View Itemized
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-200 flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedPayroll(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Single Payslip Inspector Modal */}
          {selectedPayslip && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-left">
                <div className="border-b border-slate-200 pb-4 mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{activeBusiness?.name || 'BizNexus Platform'}</h3>
                    <p className="text-xs text-slate-500 font-mono">Payslip • {selectedPayslip.payrollPeriod}</p>
                  </div>
                  <Badge variant={selectedPayslip.status === 'PAID' ? 'success' : 'neutral'}>
                    {selectedPayslip.status}
                  </Badge>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400">Employee:</span>{' '}
                      <strong>{selectedPayslip.employeeName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Department:</span> {selectedPayslip.department}
                    </div>
                    <div>
                      <span className="text-slate-400">Designation:</span> {selectedPayslip.designation}
                    </div>
                    <div>
                      <span className="text-slate-400">Working Days:</span>{' '}
                      {selectedPayslip.attendanceSummary?.presentDays || 22} /{' '}
                      {selectedPayslip.attendanceSummary?.totalWorkingDays || 22}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-700 uppercase tracking-wider mb-2 text-[11px]">
                      Earnings Breakdown
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Basic Salary:</span>
                        <span>₹{selectedPayslip.basicSalary?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>House Rent Allowance (HRA):</span>
                        <span>₹{selectedPayslip.allowances?.hra?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conveyance & Medical:</span>
                        <span>
                          ₹{((selectedPayslip.allowances?.conveyance || 0) + (selectedPayslip.allowances?.medical || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="font-bold text-slate-700 uppercase tracking-wider mb-2 text-[11px]">
                      Deductions
                    </div>
                    <div className="space-y-1 text-rose-700">
                      <div className="flex justify-between">
                        <span>Provident Fund (PF):</span>
                        <span>-₹{selectedPayslip.deductions?.pf?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Income Tax (TDS):</span>
                        <span>-₹{selectedPayslip.deductions?.tax?.toLocaleString() || 0}</span>
                      </div>
                      {selectedPayslip.deductions?.unpaidLeaveDeduction ? (
                        <div className="flex justify-between">
                          <span>Unpaid Leave Deduction:</span>
                          <span>-₹{selectedPayslip.deductions.unpaidLeaveDeduction.toLocaleString()}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>Net Disbursed Salary:</span>
                    <span className="text-emerald-600 text-lg">₹{selectedPayslip.netSalary?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPayslip(null)}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Download}
                    onClick={() => window.print()}
                  >
                    Print Payslip
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: 7 HR REPORTS & EXPORT */}
      {/* ==================================================================== */}
      {activeTab === 'reports' && reportsData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">7 Core HR Analytics Reports</h2>
              <p className="text-xs text-slate-500">Live MongoDB analytics with instant CSV and spreadsheet download.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Report 1 */}
            <Card padded={false} className="p-5 border border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 text-sm">1. Total Employee Report</h3>
                <Button variant="outline" size="sm" icon={Download} onClick={() => handleExportReport('EMPLOYEE')}>
                  CSV
                </Button>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {reportsData.totalEmployeeReport.totalEmployees}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {reportsData.totalEmployeeReport.activeEmployees} Active • {reportsData.totalEmployeeReport.probationEmployees} Inactive / Probation
              </p>
            </Card>

            {/* Report 2 */}
            <Card padded={false} className="p-5 border border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 text-sm">2. Department-wise Report</h3>
                <Button variant="outline" size="sm" icon={Download} onClick={() => handleExportReport('DEPARTMENT')}>
                  CSV
                </Button>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {reportsData.departmentWiseReport.length} Units
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Headcount and operational budgets distributed across all functional divisions.
              </p>
            </Card>

            {/* Report 3 */}
            <Card padded={false} className="p-5 border border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 text-sm">3. Daily Attendance Report</h3>
                <Button variant="outline" size="sm" icon={Download} onClick={() => handleExportReport('EMPLOYEE')}>
                  CSV
                </Button>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {reportsData.dailyAttendanceReport.attendanceRate}% Rate
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {reportsData.dailyAttendanceReport.present} Present • {reportsData.dailyAttendanceReport.late} Late • {reportsData.dailyAttendanceReport.onLeave} On Leave
              </p>
            </Card>

            {/* Report 4 */}
            <Card padded={false} className="p-5 border border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 text-sm">4. Monthly Attendance</h3>
                <Button variant="outline" size="sm" icon={Download} onClick={() => handleExportReport('EMPLOYEE')}>
                  CSV
                </Button>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {reportsData.monthlyAttendanceReport.present} Logs
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monthly check-in consistency, working hours summary, and attendance calendar metrics.
              </p>
            </Card>

            {/* Report 5 */}
            <Card padded={false} className="p-5 border border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 text-sm">5. Leave Statistics</h3>
                <Button variant="outline" size="sm" icon={Download} onClick={() => handleExportReport('LEAVE')}>
                  CSV
                </Button>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {reportsData.leaveStatisticsReport.totalRequests} Requests
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {reportsData.leaveStatisticsReport.approved} Approved • {reportsData.leaveStatisticsReport.pending} Pending • {reportsData.leaveStatisticsReport.rejected} Rejected
              </p>
            </Card>

            {/* Report 6 */}
            <Card padded={false} className="p-5 border border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 text-sm">6. Payroll Summary</h3>
                <Button variant="outline" size="sm" icon={Download} onClick={() => handleExportReport('PAYROLL')}>
                  CSV
                </Button>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                ₹{reportsData.payrollSummaryReport.totalPayrollDisbursed?.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total disbursed across {reportsData.payrollSummaryReport.totalCycles} payroll cycles.
              </p>
            </Card>

            {/* Report 7 */}
            <Card padded={false} className="p-5 border border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 text-sm">7. Recruitment Stats</h3>
                <Button variant="outline" size="sm" icon={Download} onClick={() => handleExportReport('EMPLOYEE')}>
                  CSV
                </Button>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {reportsData.recruitmentStatisticsReport.openPositions} Open Positions
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {reportsData.recruitmentStatisticsReport.totalApplications} Applicants • {reportsData.recruitmentStatisticsReport.interviewsHeld} Interviews
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: NOTIFICATION CENTER */}
      {/* ==================================================================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">HR Notification Stream</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await hrService.markAllNotificationsAsRead(businessId);
                loadTabContent();
              }}
            >
              Mark All as Read
            </Button>
          </div>

          <Card padded={false} className="border border-slate-200">
            <div className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No notifications at this time.</div>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className={`p-4 flex items-start justify-between gap-4 ${n.read ? 'bg-white' : 'bg-blue-50/40'}`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{n.title}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {!n.read && (
                      <button
                        onClick={async () => {
                          await hrService.markNotificationAsRead(businessId, n._id);
                          loadTabContent();
                        }}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODALS */}
      {/* ==================================================================== */}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingDeptId ? 'Edit Department' : 'Create Department'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Define department attributes and operational budget.</p>

            <form onSubmit={handleSaveDept} className="space-y-3">
              <div>
                <label htmlFor={deptNameId} className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  id={deptNameId}
                  required
                  type="text"
                  placeholder="e.g. Platform Architecture"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={deptCodeId} className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    id={deptCodeId}
                    required
                    type="text"
                    placeholder="ENG"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase"
                  />
                </div>
                <div>
                  <label htmlFor={deptBudgetId} className="block text-xs font-semibold text-slate-700 mb-1">Budget (₹)</label>
                  <input
                    id={deptBudgetId}
                    type="number"
                    min={0}
                    value={deptForm.budget}
                    onChange={(e) => setDeptForm({ ...deptForm, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={deptManagerId} className="block text-xs font-semibold text-slate-700 mb-1">Department Head / Manager</label>
                <select
                  id={deptManagerId}
                  value={deptForm.managerId}
                  onChange={(e) => setDeptForm({ ...deptForm, managerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select Manager</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.fullName} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={deptDescId} className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  id={deptDescId}
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowDeptModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} type="submit">
                  Save Department
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Apply for Leave</h3>
            <p className="text-xs text-slate-500 mb-4">Submit leave dates for managerial approval.</p>

            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div>
                <label htmlFor={leaveTypeId} className="block text-xs font-semibold text-slate-700 mb-1">Leave Type *</label>
                <select
                  id={leaveTypeId}
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="CASUAL_LEAVE">Casual Leave</option>
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="EARNED_LEAVE">Earned / Privilege Leave</option>
                  <option value="UNPAID_LEAVE">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={leaveStartDateId} className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    id={leaveStartDateId}
                    required
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={leaveEndDateId} className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    id={leaveEndDateId}
                    required
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={leaveReasonId} className="block text-xs font-semibold text-slate-700 mb-1">Reason *</label>
                <textarea
                  id={leaveReasonId}
                  required
                  rows={3}
                  placeholder="Provide brief context for leave request..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowLeaveModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} type="submit">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Leave Modal */}
      {showReviewLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {reviewAction === 'APPROVE' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {reviewAction === 'APPROVE'
                ? 'Approving will automatically mark attendance as ON_LEAVE and deduct leave balance.'
                : 'Please provide a clear reason for the rejection.'}
            </p>

            {reviewAction === 'REJECT' && (
              <div className="mb-4">
                <label htmlFor={rejectionReasonId} className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason *</label>
                <textarea
                  id={rejectionReasonId}
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is rejected..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowReviewLeaveModal(false)}>
                Cancel
              </Button>
              <Button
                variant={reviewAction === 'APPROVE' ? 'primary' : 'danger'}
                loading={actionLoading}
                onClick={handleConfirmReviewLeave}
              >
                Confirm {reviewAction}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Payroll Modal */}
      {showGeneratePayrollModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Generate Monthly Payroll Run</h3>
            <p className="text-xs text-slate-500 mb-4">
              Calculates gross salaries, itemized deductions, and transparent unpaid leave adjustments for active employees.
            </p>

            <form onSubmit={handleGeneratePayroll} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={payrollMonthId} className="block text-xs font-semibold text-slate-700 mb-1">Month (1 - 12)</label>
                  <input
                    id={payrollMonthId}
                    type="number"
                    min={1}
                    max={12}
                    value={payrollForm.month}
                    onChange={(e) => setPayrollForm({ ...payrollForm, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={payrollYearId} className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    id={payrollYearId}
                    type="number"
                    min={2020}
                    max={2050}
                    value={payrollForm.year}
                    onChange={(e) => setPayrollForm({ ...payrollForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={payrollNotesId} className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  id={payrollNotesId}
                  type="text"
                  value={payrollForm.notes}
                  onChange={(e) => setPayrollForm({ ...payrollForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                <strong>Duplicate Prevention:</strong> If payroll for this period was already generated, the system will prevent duplicate records.
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowGeneratePayrollModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} type="submit">
                  Execute Payroll Run
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Job Opening Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Post Job Opening</h3>
            <p className="text-xs text-slate-500 mb-4">Create position listing for candidate application pipeline.</p>

            <form onSubmit={handleSaveJob} className="space-y-3">
              <div>
                <label htmlFor={jobTitleId} className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  id={jobTitleId}
                  required
                  type="text"
                  placeholder="e.g. Senior Backend Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor={jobDeptId} className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  id={jobDeptId}
                  required
                  value={jobForm.departmentId}
                  onChange={(e) => setJobForm({ ...jobForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={jobTypeId} className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    id={jobTypeId}
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={jobExpId} className="block text-xs font-semibold text-slate-700 mb-1">Min Exp (Years)</label>
                  <input
                    id={jobExpId}
                    type="number"
                    min={0}
                    value={jobForm.experienceYears}
                    onChange={(e) => setJobForm({ ...jobForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={jobQualId} className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                <input
                  id={jobQualId}
                  type="text"
                  value={jobForm.qualifications}
                  onChange={(e) => setJobForm({ ...jobForm, qualifications: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor={jobDescId} className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
                <textarea
                  id={jobDescId}
                  rows={3}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowJobModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} type="submit">
                  Publish Position
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Schedule Candidate Interview</h3>
            <p className="text-xs text-slate-500 mb-4">Set date, interviewer, and meeting room credentials.</p>

            <form onSubmit={handleConfirmScheduleInterview} className="space-y-3">
              <div>
                <label htmlFor={interviewDateId} className="block text-xs font-semibold text-slate-700 mb-1">Interview Date & Time *</label>
                <input
                  id={interviewDateId}
                  required
                  type="datetime-local"
                  value={interviewForm.scheduledDate}
                  onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor={interviewerNameId} className="block text-xs font-semibold text-slate-700 mb-1">Lead Interviewer *</label>
                <input
                  id={interviewerNameId}
                  required
                  type="text"
                  value={interviewForm.interviewerName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor={interviewLinkId} className="block text-xs font-semibold text-slate-700 mb-1">Virtual Meeting Link</label>
                <input
                  id={interviewLinkId}
                  type="text"
                  value={interviewForm.meetingLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
              <div>
                <label htmlFor={interviewNotesId} className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  id={interviewNotesId}
                  type="text"
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowInterviewModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} type="submit">
                  Confirm Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Leave Quota Policies</h3>
            <p className="text-xs text-slate-500 mb-4">Set business-wide annual leave quotas per employee.</p>

            <form onSubmit={handleSavePolicy} className="space-y-3">
              <div>
                <label htmlFor={casualQuotaId} className="block text-xs font-semibold text-slate-700 mb-1">Casual Leave Quota (Days)</label>
                <input
                  id={casualQuotaId}
                  type="number"
                  min={0}
                  value={policyForm.casualLeaveQuota}
                  onChange={(e) => setPolicyForm({ ...policyForm, casualLeaveQuota: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor={sickQuotaId} className="block text-xs font-semibold text-slate-700 mb-1">Sick Leave Quota (Days)</label>
                <input
                  id={sickQuotaId}
                  type="number"
                  min={0}
                  value={policyForm.sickLeaveQuota}
                  onChange={(e) => setPolicyForm({ ...policyForm, sickLeaveQuota: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor={earnedQuotaId} className="block text-xs font-semibold text-slate-700 mb-1">Earned / Paid Leave Quota (Days)</label>
                <input
                  id={earnedQuotaId}
                  type="number"
                  min={0}
                  value={policyForm.earnedLeaveQuota}
                  onChange={(e) => setPolicyForm({ ...policyForm, earnedLeaveQuota: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor={carryForwardId} className="block text-xs font-semibold text-slate-700 mb-1">Carry Forward Limit (Days)</label>
                <input
                  id={carryForwardId}
                  type="number"
                  min={0}
                  value={policyForm.carryForwardLimit}
                  onChange={(e) => setPolicyForm({ ...policyForm, carryForwardLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowPolicyModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" loading={actionLoading} type="submit">
                  Save Policy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRManagementPage;
