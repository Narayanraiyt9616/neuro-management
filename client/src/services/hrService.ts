import apiClient from './api';
import {
  IApiResponse,
  IEmployee,
  IDepartment,
  IAttendanceRecord,
  ILeavePolicy,
  ILeaveBalance,
  ILeaveRequest,
  IJobOpening,
  IJobApplication,
  ISalaryStructure,
  IPayrollRecord,
  IPayslip,
  INotificationItem,
  IHRReportsData
} from '../types';

export const hrService = {
  /**
   * Helper: ensure header with businessId if present
   */
  configWithBiz(businessId?: string) {
    return businessId ? { headers: { 'x-business-id': businessId } } : {};
  },

  /**
   * ============================================================================
   * MODULE 1: EMPLOYEE MANAGEMENT
   * ============================================================================
   */

  async listEmployees(
    businessId: string,
    filters: {
      search?: string;
      departmentId?: string;
      status?: string;
      employmentType?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ employees: IEmployee[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const res = (await apiClient.get('/hr/employees', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ employees: IEmployee[]; pagination: any }>;
    return res.data || { employees: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } };
  },

  async createEmployee(businessId: string, payload: any): Promise<IEmployee> {
    const res = (await apiClient.post('/hr/employees', payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IEmployee>;
    if (!res.data) throw new Error(res.message || 'Failed to create employee');
    return res.data;
  },

  async getEmployeeById(businessId: string, id: string): Promise<any> {
    const res = (await apiClient.get(`/hr/employees/${id}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    if (!res.data) throw new Error(res.message || 'Employee not found');
    return res.data;
  },

  async updateEmployee(businessId: string, id: string, payload: any): Promise<IEmployee> {
    const res = (await apiClient.put(`/hr/employees/${id}`, payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IEmployee>;
    if (!res.data) throw new Error(res.message || 'Failed to update employee');
    return res.data;
  },

  async deleteEmployee(businessId: string, id: string): Promise<{ success: boolean; message: string }> {
    const res = (await apiClient.delete(`/hr/employees/${id}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ success: boolean; message: string }>;
    return res.data || { success: true, message: 'Employee removed' };
  },

  async toggleEmployeeStatus(businessId: string, id: string, status: string): Promise<IEmployee> {
    const res = (await apiClient.patch(
      `/hr/employees/${id}/status`,
      { status },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<IEmployee>;
    if (!res.data) throw new Error(res.message || 'Failed to change status');
    return res.data;
  },

  async uploadDocument(businessId: string, id: string, doc: { name: string; url: string; fileType: string }): Promise<IEmployee> {
    const res = (await apiClient.post(`/hr/employees/${id}/documents`, doc, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IEmployee>;
    if (!res.data) throw new Error(res.message || 'Failed to upload document');
    return res.data;
  },

  async exportEmployeesCSV(businessId: string): Promise<Blob> {
    const res = await apiClient.get('/hr/employees/export', {
      headers: { 'x-business-id': businessId },
      responseType: 'blob'
    });
    return res as unknown as Blob;
  },

  /**
   * ============================================================================
   * MODULE 2: DEPARTMENT MANAGEMENT
   * ============================================================================
   */

  async listDepartments(businessId: string): Promise<IDepartment[]> {
    const res = (await apiClient.get('/hr/departments', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IDepartment[]>;
    return res.data || [];
  },

  async getDepartmentStatistics(businessId: string): Promise<any> {
    const res = (await apiClient.get('/hr/departments/statistics', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  async createDepartment(businessId: string, payload: { name: string; code: string; description?: string; managerId?: string; budget?: number }): Promise<IDepartment> {
    const res = (await apiClient.post('/hr/departments', payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IDepartment>;
    if (!res.data) throw new Error(res.message || 'Failed to create department');
    return res.data;
  },

  async updateDepartment(businessId: string, id: string, payload: any): Promise<IDepartment> {
    const res = (await apiClient.put(`/hr/departments/${id}`, payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IDepartment>;
    if (!res.data) throw new Error(res.message || 'Failed to update department');
    return res.data;
  },

  async deleteDepartment(businessId: string, id: string): Promise<any> {
    const res = (await apiClient.delete(`/hr/departments/${id}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  async assignDepartmentManager(businessId: string, id: string, managerId: string): Promise<IDepartment> {
    const res = (await apiClient.patch(
      `/hr/departments/${id}/manager`,
      { managerId },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<IDepartment>;
    return res.data!;
  },

  async assignEmployeesToDepartment(businessId: string, id: string, employeeIds: string[]): Promise<any> {
    const res = (await apiClient.post(
      `/hr/departments/${id}/assign`,
      { employeeIds },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 3: ATTENDANCE MANAGEMENT
   * ============================================================================
   */

  async checkIn(businessId: string, notes?: string): Promise<IAttendanceRecord> {
    const res = (await apiClient.post(
      '/hr/attendance/check-in',
      { notes },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<IAttendanceRecord>;
    if (!res.data) throw new Error(res.message || 'Check-in failed');
    return res.data;
  },

  async checkOut(businessId: string, notes?: string): Promise<IAttendanceRecord> {
    const res = (await apiClient.post(
      '/hr/attendance/check-out',
      { notes },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<IAttendanceRecord>;
    if (!res.data) throw new Error(res.message || 'Check-out failed');
    return res.data;
  },

  async getTodayAttendance(businessId: string): Promise<IAttendanceRecord | null> {
    const res = (await apiClient.get('/hr/attendance/today', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IAttendanceRecord>;
    return res.data || null;
  },

  async listAttendance(
    businessId: string,
    filters: { employeeId?: string; status?: string; startDate?: string; endDate?: string } = {}
  ): Promise<IAttendanceRecord[]> {
    const res = (await apiClient.get('/hr/attendance', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IAttendanceRecord[]>;
    return res.data || [];
  },

  async getAttendanceCalendar(businessId: string, employeeId: string, month: number, year: number): Promise<any> {
    const res = (await apiClient.get(`/hr/attendance/calendar/${employeeId}`, {
      params: { month, year },
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 4: LEAVE MANAGEMENT
   * ============================================================================
   */

  async getLeavePolicy(businessId: string): Promise<ILeavePolicy> {
    const res = (await apiClient.get('/hr/leaves/policy', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ILeavePolicy>;
    return res.data!;
  },

  async updateLeavePolicy(businessId: string, policy: Partial<ILeavePolicy>): Promise<ILeavePolicy> {
    const res = (await apiClient.put('/hr/leaves/policy', policy, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ILeavePolicy>;
    return res.data!;
  },

  async getEmployeeLeaveBalance(businessId: string, employeeId: string): Promise<ILeaveBalance> {
    const res = (await apiClient.get(`/hr/leaves/balance/${employeeId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ILeaveBalance>;
    return res.data!;
  },

  async applyLeave(
    businessId: string,
    payload: { leaveType: string; startDate: string; endDate: string; reason: string }
  ): Promise<ILeaveRequest> {
    const res = (await apiClient.post('/hr/leaves', payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ILeaveRequest>;
    if (!res.data) throw new Error(res.message || 'Failed to submit leave application');
    return res.data;
  },

  async listLeaveRequests(businessId: string, filters: { employeeId?: string; status?: string } = {}): Promise<ILeaveRequest[]> {
    const res = (await apiClient.get('/hr/leaves', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ILeaveRequest[]>;
    return res.data || [];
  },

  async reviewLeave(
    businessId: string,
    leaveId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ): Promise<ILeaveRequest> {
    const res = (await apiClient.patch(
      `/hr/leaves/${leaveId}/review`,
      { action, rejectionReason },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<ILeaveRequest>;
    if (!res.data) throw new Error(res.message || 'Failed to review leave');
    return res.data;
  },

  async cancelLeave(businessId: string, leaveId: string): Promise<ILeaveRequest> {
    const res = (await apiClient.patch(
      `/hr/leaves/${leaveId}/cancel`,
      {},
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<ILeaveRequest>;
    return res.data!;
  },

  /**
   * ============================================================================
   * MODULE 5: RECRUITMENT MANAGEMENT
   * ============================================================================
   */

  async listJobOpenings(businessId: string, filters: { departmentId?: string; status?: string } = {}): Promise<IJobOpening[]> {
    const res = (await apiClient.get('/hr/recruitment/jobs', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IJobOpening[]>;
    return res.data || [];
  },

  async createJobOpening(businessId: string, payload: any): Promise<IJobOpening> {
    const res = (await apiClient.post('/hr/recruitment/jobs', payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IJobOpening>;
    if (!res.data) throw new Error(res.message || 'Failed to create job opening');
    return res.data;
  },

  async updateJobOpening(businessId: string, id: string, payload: any): Promise<IJobOpening> {
    const res = (await apiClient.put(`/hr/recruitment/jobs/${id}`, payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IJobOpening>;
    return res.data!;
  },

  async deleteJobOpening(businessId: string, id: string): Promise<any> {
    const res = (await apiClient.delete(`/hr/recruitment/jobs/${id}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  async listApplications(businessId: string, jobOpeningId?: string, status?: string): Promise<IJobApplication[]> {
    const res = (await apiClient.get('/hr/recruitment/applications', {
      params: { jobOpeningId, status },
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IJobApplication[]>;
    return res.data || [];
  },

  async submitApplication(businessId: string, payload: any): Promise<IJobApplication> {
    const res = (await apiClient.post('/hr/recruitment/applications', payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IJobApplication>;
    if (!res.data) throw new Error(res.message || 'Failed to submit application');
    return res.data;
  },

  async updateApplicationStatus(businessId: string, id: string, status: string): Promise<IJobApplication> {
    const res = (await apiClient.patch(
      `/hr/recruitment/applications/${id}/status`,
      { status },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<IJobApplication>;
    return res.data!;
  },

  async scheduleInterview(
    businessId: string,
    id: string,
    interview: { scheduledDate: string; interviewerName: string; notes?: string; meetingLink?: string }
  ): Promise<IJobApplication> {
    const res = (await apiClient.post(`/hr/recruitment/applications/${id}/interview`, interview, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IJobApplication>;
    if (!res.data) throw new Error(res.message || 'Failed to schedule interview');
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 6: PAYROLL MANAGEMENT
   * ============================================================================
   */

  async getSalaryStructure(businessId: string, employeeId: string): Promise<ISalaryStructure | null> {
    const res = (await apiClient.get(`/hr/payroll/salary-structure/${employeeId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISalaryStructure>;
    return res.data || null;
  },

  async upsertSalaryStructure(businessId: string, payload: any): Promise<ISalaryStructure> {
    const res = (await apiClient.put('/hr/payroll/salary-structure', payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISalaryStructure>;
    return res.data!;
  },

  async generateMonthlyPayroll(businessId: string, payload: { month: number; year: number; notes?: string }): Promise<any> {
    const res = (await apiClient.post('/hr/payroll/generate', payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    if (!res.data) throw new Error(res.message || 'Failed to generate payroll');
    return res.data;
  },

  async listPayrolls(businessId: string): Promise<IPayrollRecord[]> {
    const res = (await apiClient.get('/hr/payroll', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IPayrollRecord[]>;
    return res.data || [];
  },

  async getPayrollDetails(businessId: string, id: string): Promise<{ payroll: IPayrollRecord; payslips: IPayslip[] }> {
    const res = (await apiClient.get(`/hr/payroll/details/${id}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ payroll: IPayrollRecord; payslips: IPayslip[] }>;
    if (!res.data) throw new Error(res.message || 'Payroll details not found');
    return res.data;
  },

  async updatePayrollStatus(businessId: string, id: string, status: string, paymentDate?: string): Promise<IPayrollRecord> {
    const res = (await apiClient.patch(
      `/hr/payroll/${id}/status`,
      { status, paymentDate },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<IPayrollRecord>;
    return res.data!;
  },

  async getEmployeePayslips(businessId: string): Promise<IPayslip[]> {
    const res = (await apiClient.get('/hr/payroll/employee/payslips', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IPayslip[]>;
    return res.data || [];
  },

  async getPayslipById(businessId: string, id: string): Promise<IPayslip> {
    const res = (await apiClient.get(`/hr/payroll/payslips/${id}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IPayslip>;
    if (!res.data) throw new Error(res.message || 'Payslip not found');
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 7: HR REPORTS
   * ============================================================================
   */

  async getHRReports(businessId: string): Promise<IHRReportsData> {
    const res = (await apiClient.get('/hr/reports', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IHRReportsData>;
    return res.data!;
  },

  async exportReportCSV(businessId: string, type: string): Promise<Blob> {
    const res = await apiClient.get('/hr/reports/export', {
      params: { type },
      headers: { 'x-business-id': businessId },
      responseType: 'blob'
    });
    return res as unknown as Blob;
  },

  /**
   * ============================================================================
   * MODULE 8: NOTIFICATIONS
   * ============================================================================
   */

  async getUserNotifications(businessId: string, unreadOnly: boolean = false): Promise<INotificationItem[]> {
    const res = (await apiClient.get('/hr/notifications', {
      params: { unread: unreadOnly },
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<INotificationItem[]>;
    return res.data || [];
  },

  async markNotificationAsRead(businessId: string, id: string): Promise<void> {
    await apiClient.patch(
      `/hr/notifications/${id}/read`,
      {},
      { headers: { 'x-business-id': businessId } }
    );
  },

  async markAllNotificationsAsRead(businessId: string): Promise<void> {
    await apiClient.patch(
      '/hr/notifications/read-all',
      {},
      { headers: { 'x-business-id': businessId } }
    );
  }
};

export default hrService;

