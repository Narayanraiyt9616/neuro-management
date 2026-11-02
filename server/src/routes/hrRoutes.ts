import { Router } from 'express';
import hrController from '../controllers/hrController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router: Router = Router();

// All HR routes require authentication
router.use(authenticateToken);

/**
 * ============================================================================
 * MODULE 1: EMPLOYEE MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/employees',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.listEmployees
);

router.get(
  '/employees/export',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.exportEmployees
);

router.post(
  '/employees',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.createEmployee
);

router.get(
  '/employees/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.getEmployeeById
);

router.put(
  '/employees/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.updateEmployee
);

router.delete(
  '/employees/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.deleteEmployee
);

router.patch(
  '/employees/:id/status',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.toggleEmployeeStatus
);

router.post(
  '/employees/:id/documents',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.uploadDocument
);

/**
 * ============================================================================
 * MODULE 2: DEPARTMENT MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/departments',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.listDepartments
);

router.get(
  '/departments/statistics',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.getDepartmentStatistics
);

router.post(
  '/departments',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.createDepartment
);

router.put(
  '/departments/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.updateDepartment
);

router.delete(
  '/departments/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.deleteDepartment
);

router.patch(
  '/departments/:id/manager',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.assignDepartmentManager
);

router.post(
  '/departments/:id/assign',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.assignEmployeesToDepartment
);

/**
 * ============================================================================
 * MODULE 3: ATTENDANCE MANAGEMENT ROUTES
 * ============================================================================
 */
router.post(
  '/attendance/check-in',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.checkIn
);

router.post(
  '/attendance/check-out',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.checkOut
);

router.get(
  '/attendance/today',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.getTodayAttendance
);

router.get(
  '/attendance',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.listAttendance
);

router.get(
  '/attendance/calendar/:employeeId',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.getAttendanceCalendar
);

/**
 * ============================================================================
 * MODULE 4: LEAVE MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/leaves/policy',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.getLeavePolicy
);

router.put(
  '/leaves/policy',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.updateLeavePolicy
);

router.get(
  '/leaves/balance/:employeeId',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.getEmployeeLeaveBalance
);

router.post(
  '/leaves',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.applyLeave
);

router.get(
  '/leaves',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.listLeaveRequests
);

router.patch(
  '/leaves/:id/review',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.reviewLeave
);

router.patch(
  '/leaves/:id/cancel',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.cancelLeave
);

/**
 * ============================================================================
 * MODULE 5: RECRUITMENT MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/recruitment/jobs',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.listJobOpenings
);

router.post(
  '/recruitment/jobs',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.createJobOpening
);

router.put(
  '/recruitment/jobs/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.updateJobOpening
);

router.delete(
  '/recruitment/jobs/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.deleteJobOpening
);

router.get(
  '/recruitment/applications',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.listApplications
);

router.post(
  '/recruitment/applications',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.submitApplication
);

router.patch(
  '/recruitment/applications/:id/status',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.updateApplicationStatus
);

router.post(
  '/recruitment/applications/:id/interview',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.scheduleInterview
);

/**
 * ============================================================================
 * MODULE 6: PAYROLL MANAGEMENT ROUTES
 * ============================================================================
 */
router.get(
  '/payroll/salary-structure/:employeeId',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.getSalaryStructure
);

router.put(
  '/payroll/salary-structure',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.upsertSalaryStructure
);

router.post(
  '/payroll/generate',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.generateMonthlyPayroll
);

router.get(
  '/payroll',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.listPayrolls
);

router.get(
  '/payroll/details/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.getPayrollDetails
);

router.patch(
  '/payroll/:id/status',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  hrController.updatePayrollStatus
);

router.get(
  '/payroll/employee/payslips',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.getEmployeePayslips
);

router.get(
  '/payroll/payslips/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.getPayslipById
);

/**
 * ============================================================================
 * MODULE 7: HR REPORTS & EXPORT ROUTES
 * ============================================================================
 */
router.get(
  '/reports',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.getHRReports
);

router.get(
  '/reports/export',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  hrController.exportReportCSV
);

/**
 * ============================================================================
 * MODULE 8: NOTIFICATION SYSTEM ROUTES
 * ============================================================================
 */
router.get(
  '/notifications',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.getUserNotifications
);

router.patch(
  '/notifications/:id/read',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.markNotificationAsRead
);

router.patch(
  '/notifications/read-all',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  hrController.markAllNotificationsAsRead
);

export default router;

