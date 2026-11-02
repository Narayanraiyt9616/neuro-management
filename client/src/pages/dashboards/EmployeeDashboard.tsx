import React, { useState, useEffect, useId } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import hrService from '../../services/hrService';
import { IAttendanceRecord, IPayslip, ILeaveRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  FileText,
  Check,
  LogIn,
  LogOut,
  DollarSign,
  CalendarCheck,
  Download,
  AlertTriangle,
  X,
  Plus
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Generate unique IDs for form accessibility
  const leaveTypeId = useId();
  const leaveStartDateId = useId();
  const leaveEndDateId = useId();
  const leaveReasonId = useId();

  // State
  const [todayAttendance, setTodayAttendance] = useState<IAttendanceRecord | null>(null);
  const [payslips, setPayslips] = useState<IPayslip[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<ILeaveRequest[]>([]);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL_LEAVE',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [selectedPayslip, setSelectedPayslip] = useState<IPayslip | null>(null);

  // Work tasks
  const [tasks, setTasks] = useState([
    { id: 'TSK-401', title: 'Audit Q3 Warehouse Bay-4 Stock Levels', due: 'Today at 5:00 PM', priority: 'High', status: 'In Progress', module: 'Inventory' },
    { id: 'TSK-402', title: 'Compile Supplier Delivery Discrepancy Report', due: 'Tomorrow', priority: 'Medium', status: 'Pending', module: 'Operations' },
    { id: 'TSK-403', title: 'Complete Bi-Annual Safety Protocol Refresh', due: '05 Nov 2026', priority: 'Low', status: 'Completed', module: 'Compliance' },
    { id: 'TSK-404', title: 'Customer Fulfillment Dispatch Verification', due: '06 Nov 2026', priority: 'Medium', status: 'Pending', module: 'Logistics' }
  ]);

  const loadSelfServiceData = async () => {
    if (!businessId) return;
    try {
      const [todayAtt, myPayslips, myLeaves] = await Promise.all([
        hrService.getTodayAttendance(businessId),
        hrService.getEmployeePayslips(businessId),
        hrService.listLeaveRequests(businessId)
      ]);
      setTodayAttendance(todayAtt);
      setPayslips(myPayslips);
      setLeaveHistory(myLeaves);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    loadSelfServiceData();
  }, [businessId]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const att = await hrService.checkIn(businessId);
      setTodayAttendance(att);
      setSuccessMsg(`Checked in at ${new Date().toLocaleTimeString()} (Status: ${att.status})`);
      loadSelfServiceData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const att = await hrService.checkOut(businessId);
      setTodayAttendance(att);
      setSuccessMsg(`Checked out at ${new Date().toLocaleTimeString()} (${att.workingHours} hrs worked)`);
      loadSelfServiceData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await hrService.applyLeave(businessId, leaveForm);
      setSuccessMsg('Leave request submitted successfully.');
      setShowLeaveModal(false);
      loadSelfServiceData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Leave application failed');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleTaskStatus = (id: string): void => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Staff Portal & Self-Service Workspace</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Staff Employee
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Welcome, <span className="font-semibold text-white">{user?.name}</span> ({user?.email}) • Active Shift: 09:30 - 18:30 • Live Attendance Synced
            </p>
          </div>
        </div>

        {/* Live Attendance Clock In / Out Buttons */}
        <div className="flex items-center gap-2">
          {!todayAttendance ? (
            <Button
              variant="primary"
              size="sm"
              icon={LogIn}
              loading={actionLoading}
              onClick={handleCheckIn}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Check In
            </Button>
          ) : !todayAttendance.checkOut ? (
            <Button
              variant="primary"
              size="sm"
              icon={LogOut}
              loading={actionLoading}
              onClick={handleCheckOut}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Check Out
            </Button>
          ) : (
            <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold">
              Checked Out ({todayAttendance.workingHours} hrs)
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setShowLeaveModal(true)}
            className="text-white border-slate-700 hover:bg-slate-800"
          >
            Apply Leave
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Status</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {todayAttendance?.status || 'Not Checked In'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {todayAttendance?.checkIn
              ? `Check-in: ${new Date(todayAttendance.checkIn).toLocaleTimeString()}`
              : 'Record check-in before 09:30 AM'}
          </div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Tasks</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">4 Tasks</span>
            <span className="text-xs text-amber-600 font-semibold">1 active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Weekly workload</div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Payslips</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{payslips.length} Cycles</span>
            <span className="text-xs text-emerald-600 font-semibold">Current</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Itemized statements ready</div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Status</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{leaveHistory.length} Applied</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Dossier records</div>
        </Card>
      </div>

      {/* Payslips & Leaves Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Payslips Card */}
        <Card className="border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">My Generated Payslips</h2>
            <span className="text-xs text-slate-500">{payslips.length} records</span>
          </div>
          <div className="divide-y divide-slate-100">
            {payslips.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No payslips generated for your profile yet.</div>
            ) : (
              payslips.map((ps) => (
                <div key={ps._id} className="p-4 flex items-center justify-between hover:bg-slate-50/60">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{ps.payrollPeriod}</div>
                    <div className="text-[11px] text-slate-500">
                      Net: ₹{ps.netSalary?.toLocaleString()} • {ps.attendanceSummary?.workingHours} hrs worked
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => setSelectedPayslip(ps)}
                  >
                    Inspect
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* My Leave Requests Card */}
        <Card className="border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Leave Applications</h2>
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => setShowLeaveModal(true)}>
              New Leave
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {leaveHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No leave requests on record.</div>
            ) : (
              leaveHistory.slice(0, 5).map((l) => (
                <div key={l._id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{l.leaveType.replace('_', ' ')}</div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(l.startDate).toISOString().split('T')[0]} ({l.daysCount} days)
                    </div>
                  </div>
                  <Badge
                    variant={
                      l.status === 'APPROVED'
                        ? 'success'
                        : l.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {l.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Task Queue Card */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              My Assigned Work Orders & Tasks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Click a task checkbox to mark completed</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                    task.status === 'Completed'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-blue-500 bg-white'
                  }`}
                  aria-label="Toggle task completion"
                >
                  {task.status === 'Completed' && <Check className="w-3.5 h-3.5" />}
                </button>
                <div>
                  <div className={`font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-slate-600">{task.id}</span>
                    <span>•</span>
                    <span>Due: {task.due}</span>
                    <span>•</span>
                    <span className="text-slate-600">Module: {task.module}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'warning'}>
                  {task.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Submit Leave Application</h3>
            <p className="text-xs text-slate-500 mb-4">Request approval for planned absence.</p>

            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div>
                <label htmlFor={leaveTypeId} className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
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
                  <label htmlFor={leaveStartDateId} className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
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
                  <label htmlFor={leaveEndDateId} className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
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
                <label htmlFor={leaveReasonId} className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <textarea
                  id={leaveReasonId}
                  required
                  rows={3}
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

      {/* Inspect Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-left">
            <div className="border-b border-slate-200 pb-4 mb-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{activeBusiness?.name || 'BizNexus Platform'}</h3>
                <p className="text-xs text-slate-500 font-mono">My Payslip • {selectedPayslip.payrollPeriod}</p>
              </div>
              <Badge variant="success">CONFIRMED</Badge>
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

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Basic Pay:</span>
                  <span>₹{selectedPayslip.basicSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowances (HRA/Conveyance):</span>
                  <span>₹{(selectedPayslip.grossSalary - selectedPayslip.basicSalary)?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Deductions (Tax/PF/Leaves):</span>
                  <span>-₹{(selectedPayslip.grossSalary - selectedPayslip.netSalary)?.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Net Disbursed:</span>
                <span className="text-emerald-600 text-lg">₹{selectedPayslip.netSalary?.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayslip(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" icon={Download} onClick={() => window.print()}>
                Print / Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
