import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import HRService from '../services/hrService';
import ApiResponse from '../utils/apiResponse';
import {
  employeeInputSchema,
  employeeUpdateSchema,
  employeeDocumentUploadSchema,
  departmentInputSchema,
  departmentUpdateSchema,
  assignManagerSchema,
  assignEmployeesSchema,
  checkInSchema,
  checkOutSchema,
  leaveRequestSchema,
  leaveActionSchema,
  leavePolicySchema,
  jobOpeningSchema,
  jobApplicationSchema,
  interviewScheduleSchema,
  salaryStructureSchema,
  payrollGenerateSchema,
  payrollStatusSchema
} from '../validators/hrValidator';

/**
 * Extracts target businessId from req.params, req.headers, req.user or query
 */
export function extractBusinessId(req: IAuthRequest): string {
  const bizId =
    req.params.businessId ||
    (req.headers['x-business-id'] as string) ||
    (req.query.businessId as string) ||
    req.user?.businessId;

  if (!bizId) {
    throw new Error('Business identifier is required.');
  }
  return String(bizId);
}

function getIdParam(req: IAuthRequest, paramName: string = 'id'): string {
  const val = req.params[paramName];
  if (Array.isArray(val)) return val[0];
  return String(val || '');
}

export const hrController = {
  /**
   * ============================================================================
   * MODULE 1: EMPLOYEES
   * ============================================================================
   */

  async listEmployees(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const { search, departmentId, status, employmentType, page, limit } = req.query as any;

      const result = await HRService.listEmployees(businessId, {
        search,
        departmentId,
        status,
        employmentType,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50
      });

      return ApiResponse.success(res, result, 'Employees retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async createEmployee(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = employeeInputSchema.parse(req.body);
      const employee = await HRService.createEmployee(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, employee, 'Employee created successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getEmployeeById(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const employee = await HRService.getEmployeeById(businessId, id);
      return ApiResponse.success(res, employee, 'Employee details retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async updateEmployee(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const validated = employeeUpdateSchema.parse(req.body);
      const updated = await HRService.updateEmployee(businessId, id, validated, req.user?.userId);
      return ApiResponse.success(res, updated, 'Employee profile updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async deleteEmployee(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const result = await HRService.deleteEmployee(businessId, id, req.user?.userId);
      return ApiResponse.success(res, result, 'Employee deleted successfully.');
    } catch (err) {
      next(err);
    }
  },

  async toggleEmployeeStatus(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const { status } = req.body;
      if (!['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'].includes(status)) {
        return ApiResponse.error(res, 'Invalid status value.', 400);
      }
      const updated = await HRService.toggleEmployeeStatus(businessId, id, status, req.user?.userId);
      return ApiResponse.success(res, updated, `Employee status changed to ${status}.`);
    } catch (err) {
      next(err);
    }
  },

  async uploadDocument(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const validated = employeeDocumentUploadSchema.parse(req.body);
      const employee = await HRService.uploadDocument(businessId, id, validated, req.user?.userId);
      return ApiResponse.success(res, employee, 'Document uploaded successfully.');
    } catch (err) {
      next(err);
    }
  },

  async exportEmployees(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const csv = await HRService.exportEmployees(businessId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  },

  /**
   * ============================================================================
   * MODULE 2: DEPARTMENTS
   * ============================================================================
   */

  async listDepartments(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const departments = await HRService.listDepartments(businessId);
      return ApiResponse.success(res, departments, 'Departments retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async createDepartment(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = departmentInputSchema.parse(req.body);
      const dept = await HRService.createDepartment(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, dept, 'Department created successfully.');
    } catch (err) {
      next(err);
    }
  },

  async updateDepartment(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const validated = departmentUpdateSchema.parse(req.body);
      const updated = await HRService.updateDepartment(businessId, id, validated, req.user?.userId);
      return ApiResponse.success(res, updated, 'Department updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async deleteDepartment(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const result = await HRService.deleteDepartment(businessId, id, req.user?.userId);
      return ApiResponse.success(res, result, 'Department deleted successfully.');
    } catch (err) {
      next(err);
    }
  },

  async assignDepartmentManager(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const validated = assignManagerSchema.parse(req.body);
      const updated = await HRService.assignDepartmentManager(businessId, id, validated.managerId, req.user?.userId);
      return ApiResponse.success(res, updated, 'Department manager assigned successfully.');
    } catch (err) {
      next(err);
    }
  },

  async assignEmployeesToDepartment(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const validated = assignEmployeesSchema.parse(req.body);
      const result = await HRService.assignEmployeesToDepartment(businessId, id, validated.employeeIds, req.user?.userId);
      return ApiResponse.success(res, result, 'Employees assigned to department successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getDepartmentStatistics(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const stats = await HRService.getDepartmentStatistics(businessId);
      return ApiResponse.success(res, stats, 'Department statistics retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * ============================================================================
   * MODULE 3: ATTENDANCE
   * ============================================================================
   */

  async checkIn(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = checkInSchema.parse(req.body);
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      const record = await HRService.checkIn(businessId, actorUserId, validated);
      return ApiResponse.success(res, record, 'Check-in successful.');
    } catch (err) {
      next(err);
    }
  },

  async checkOut(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = checkOutSchema.parse(req.body);
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      const record = await HRService.checkOut(businessId, actorUserId, validated);
      return ApiResponse.success(res, record, 'Check-out successful.');
    } catch (err) {
      next(err);
    }
  },

  async getTodayAttendance(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      const record = await HRService.getTodayAttendance(businessId, actorUserId);
      return ApiResponse.success(res, record, 'Today attendance retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async listAttendance(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const { employeeId, status, startDate, endDate } = req.query as any;

      const list = await HRService.listAttendance(businessId, {
        employeeId,
        status,
        startDate,
        endDate
      });

      return ApiResponse.success(res, list, 'Attendance records retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async getAttendanceCalendar(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const employeeId = getIdParam(req, 'employeeId');
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const year = Number(req.query.year) || new Date().getFullYear();

      const calendar = await HRService.getAttendanceCalendar(businessId, employeeId, month, year);
      return ApiResponse.success(res, calendar, 'Attendance calendar retrieved.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * ============================================================================
   * MODULE 4: LEAVES
   * ============================================================================
   */

  async getLeavePolicy(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const policy = await HRService.getLeavePolicy(businessId);
      return ApiResponse.success(res, policy, 'Leave policy retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async updateLeavePolicy(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = leavePolicySchema.parse(req.body);
      const policy = await HRService.updateLeavePolicy(businessId, validated, req.user?.userId);
      return ApiResponse.success(res, policy, 'Leave policy updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getEmployeeLeaveBalance(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const employeeId = getIdParam(req, 'employeeId');
      const balances = await HRService.getEmployeeLeaveBalance(businessId, employeeId);
      return ApiResponse.success(res, balances, 'Leave balances retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async applyLeave(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = leaveRequestSchema.parse(req.body);
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      const leave = await HRService.applyLeave(businessId, actorUserId, validated);
      return ApiResponse.created(res, leave, 'Leave request submitted successfully.');
    } catch (err) {
      next(err);
    }
  },

  async listLeaveRequests(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const { employeeId, status } = req.query as any;

      const list = await HRService.listLeaveRequests(businessId, { employeeId, status });
      return ApiResponse.success(res, list, 'Leave requests retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async reviewLeave(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const validated = leaveActionSchema.parse(req.body);
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      const reviewed = await HRService.reviewLeave(businessId, id, actorUserId, validated.action, validated.rejectionReason);
      return ApiResponse.success(res, reviewed, `Leave request has been ${validated.action.toLowerCase()}ed.`);
    } catch (err) {
      next(err);
    }
  },

  async cancelLeave(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      const cancelled = await HRService.cancelLeave(businessId, id, actorUserId);
      return ApiResponse.success(res, cancelled, 'Leave request cancelled.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * ============================================================================
   * MODULE 5: RECRUITMENT
   * ============================================================================
   */

  async listJobOpenings(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const { departmentId, status } = req.query as any;
      const openings = await HRService.listJobOpenings(businessId, { departmentId, status });
      return ApiResponse.success(res, openings, 'Job openings retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async createJobOpening(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = jobOpeningSchema.parse(req.body);
      const opening = await HRService.createJobOpening(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, opening, 'Job opening created successfully.');
    } catch (err) {
      next(err);
    }
  },

  async updateJobOpening(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const validated = jobOpeningSchema.partial().parse(req.body);
      const updated = await HRService.updateJobOpening(businessId, id, validated, req.user?.userId);
      return ApiResponse.success(res, updated, 'Job opening updated.');
    } catch (err) {
      next(err);
    }
  },

  async deleteJobOpening(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      await HRService.deleteJobOpening(businessId, id, req.user?.userId);
      return ApiResponse.success(res, { success: true }, 'Job opening deleted.');
    } catch (err) {
      next(err);
    }
  },

  async listApplications(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const { jobOpeningId, status } = req.query as any;
      const list = await HRService.listApplications(businessId, jobOpeningId, status);
      return ApiResponse.success(res, list, 'Applications retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async submitApplication(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = jobApplicationSchema.parse(req.body);
      const application = await HRService.submitApplication(businessId, validated);
      return ApiResponse.created(res, application, 'Application submitted successfully.');
    } catch (err) {
      next(err);
    }
  },

  async updateApplicationStatus(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const { status } = req.body;
      const updated = await HRService.updateApplicationStatus(businessId, id, status, req.user?.userId);
      return ApiResponse.success(res, updated, `Application status updated to ${status}.`);
    } catch (err) {
      next(err);
    }
  },

  async scheduleInterview(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const validated = interviewScheduleSchema.parse(req.body);
      const updated = await HRService.scheduleInterview(businessId, id, validated, req.user?.userId);
      return ApiResponse.success(res, updated, 'Interview scheduled successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * ============================================================================
   * MODULE 6: PAYROLL
   * ============================================================================
   */

  async getSalaryStructure(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const employeeId = getIdParam(req, 'employeeId');
      const structure = await HRService.getSalaryStructure(businessId, employeeId);
      return ApiResponse.success(res, structure, 'Salary structure retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async upsertSalaryStructure(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = salaryStructureSchema.parse(req.body);
      const struct = await HRService.upsertSalaryStructure(businessId, validated, req.user?.userId);
      return ApiResponse.success(res, struct, 'Salary structure updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async generateMonthlyPayroll(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const validated = payrollGenerateSchema.parse(req.body);
      const result = await HRService.generateMonthlyPayroll(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, result, 'Monthly payroll generated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async listPayrolls(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const list = await HRService.listPayrolls(businessId);
      return ApiResponse.success(res, list, 'Payrolls retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async getPayrollDetails(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const result = await HRService.getPayrollDetails(businessId, id);
      return ApiResponse.success(res, result, 'Payroll details retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async updatePayrollStatus(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const validated = payrollStatusSchema.parse(req.body);
      const updated = await HRService.updatePayrollStatus(businessId, id, validated.status, validated.paymentDate, req.user?.userId);
      return ApiResponse.success(res, updated, `Payroll status marked as ${validated.status}.`);
    } catch (err) {
      next(err);
    }
  },

  async getEmployeePayslips(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      const payslips = await HRService.getEmployeePayslips(businessId, actorUserId);
      return ApiResponse.success(res, payslips, 'Payslips retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async getPayslipById(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const payslip = await HRService.getPayslipById(businessId, id);
      return ApiResponse.success(res, payslip, 'Payslip details retrieved.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * ============================================================================
   * MODULE 7: HR REPORTS
   * ============================================================================
   */

  async getHRReports(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const reports = await HRService.getHRReports(businessId);
      return ApiResponse.success(res, reports, 'HR reports retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async exportReportCSV(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const reportType = (req.query.type as string) || 'EMPLOYEE';
      const csv = await HRService.exportReportCSV(businessId, reportType);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType.toLowerCase()}_report.csv"`);
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  },

  /**
   * ============================================================================
   * MODULE 8: NOTIFICATIONS
   * ============================================================================
   */

  async getUserNotifications(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const unreadOnly = req.query.unread === 'true';
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      const notifs = await HRService.getUserNotifications(businessId, actorUserId, unreadOnly);
      return ApiResponse.success(res, notifs, 'Notifications retrieved.');
    } catch (err) {
      next(err);
    }
  },

  async markNotificationAsRead(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const id = getIdParam(req);
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      await HRService.markNotificationAsRead(businessId, id, actorUserId);
      return ApiResponse.success(res, { success: true }, 'Notification marked as read.');
    } catch (err) {
      next(err);
    }
  },

  async markAllNotificationsAsRead(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = extractBusinessId(req);
      const actorUserId = req.user?.userId;
      if (!actorUserId) return ApiResponse.error(res, 'User ID required.', 401);

      await HRService.markAllNotificationsAsRead(businessId, actorUserId);
      return ApiResponse.success(res, { success: true }, 'All notifications marked as read.');
    } catch (err) {
      next(err);
    }
  }
};

export default hrController;
