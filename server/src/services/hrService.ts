import mongoose, { Types } from 'mongoose';
import Employee, { IEmployeeDocument } from '../models/Employee';
import Department, { IDepartmentDocument } from '../models/Department';
import Attendance, { IAttendanceDocument, AttendanceStatus } from '../models/Attendance';
import LeavePolicy, { ILeavePolicyDocument } from '../models/LeavePolicy';
import LeaveRequest, { ILeaveRequestDocument } from '../models/LeaveRequest';
import JobOpening, { IJobOpeningDocument } from '../models/JobOpening';
import JobApplication, { IJobApplicationDocument } from '../models/JobApplication';
import SalaryStructure, { ISalaryStructureDocument } from '../models/SalaryStructure';
import Payroll, { IPayrollDocument } from '../models/Payroll';
import Payslip, { IPayslipDocument } from '../models/Payslip';
import Notification, { INotificationDocument, NotificationType } from '../models/Notification';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import resilientAuthStore from './resilientAuthStore';
import logger from '../utils/logger';
import {
  IEmployeeInput,
  IEmployeeUpdateInput,
  IEmployeeDocumentUploadInput,
  IDepartmentInput,
  IDepartmentUpdateInput,
  IAttendanceCheckInInput,
  IAttendanceCheckOutInput,
  IAttendanceFilter,
  ILeaveRequestInput,
  ILeavePolicyInput,
  IJobOpeningInput,
  IJobApplicationInput,
  IInterviewScheduleInput,
  ISalaryStructureInput,
  IPayrollGenerateInput,
  PayrollStatusType
} from '../types';

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// In-memory fallback stores for non-mongo environments / offline test suites
const memEmployees: Map<string, any> = new Map();
const memDepartments: Map<string, any> = new Map();
const memAttendances: Map<string, any> = new Map();
const memLeavePolicies: Map<string, any> = new Map();
const memLeaveRequests: Map<string, any> = new Map();
const memJobOpenings: Map<string, any> = new Map();
const memJobApplications: Map<string, any> = new Map();
const memSalaryStructures: Map<string, any> = new Map();
const memPayrolls: Map<string, any> = new Map();
const memPayslips: Map<string, any> = new Map();
const memNotifications: Map<string, any> = new Map();

let hrSeedDone = false;

export async function seedDemoHRIfEmpty(businessIdStr: string): Promise<void> {
  if (hrSeedDone) return;
  hrSeedDone = true;

  const bizId = businessIdStr || '60d0fe4f5311236168a109ca';
  const bizObjId = new Types.ObjectId(bizId);

  try {
    if (isDbConnected()) {
      const deptCount = await Department.countDocuments({ businessId: bizObjId });
      if (deptCount === 0) {
        // Seed default departments
        const engDept = await Department.create({
          businessId: bizObjId,
          name: 'Engineering',
          code: 'ENG',
          description: 'Core software development & infrastructure',
          budget: 150000,
          isActive: true
        });

        const hrDept = await Department.create({
          businessId: bizObjId,
          name: 'Human Resources',
          code: 'HR',
          description: 'Talent acquisition, culture and compliance',
          budget: 45000,
          isActive: true
        });

        const mktDept = await Department.create({
          businessId: bizObjId,
          name: 'Marketing & Sales',
          code: 'MKT',
          description: 'Customer growth and brand relations',
          budget: 65000,
          isActive: true
        });

        // Seed leave policy
        await LeavePolicy.create({
          businessId: bizObjId,
          casualLeaveQuota: 12,
          sickLeaveQuota: 10,
          earnedLeaveQuota: 15,
          unpaidLeaveAllowed: true,
          carryForwardLimit: 5
        });

        // Seed default employees
        const emp1 = await Employee.create({
          businessId: bizObjId,
          employeeId: 'EMP-1001',
          fullName: 'Sophia Lin',
          email: 'employee@nexuscorp.com',
          phone: '+1 (555) 400-0004',
          designation: 'Senior Full Stack Engineer',
          departmentId: engDept._id,
          departmentName: 'Engineering',
          joiningDate: new Date('2024-03-15'),
          employmentType: 'FULL_TIME',
          salary: { basicSalary: 85000, currency: 'USD' },
          status: 'ACTIVE',
          emergencyContact: { name: 'Kevin Lin', relationship: 'Spouse', phone: '+1 (555) 400-9999' }
        });

        const emp2 = await Employee.create({
          businessId: bizObjId,
          employeeId: 'EMP-1002',
          fullName: 'Marcus Thorne',
          email: 'manager@nexuscorp.com',
          phone: '+1 (555) 300-0003',
          designation: 'Engineering Manager',
          departmentId: engDept._id,
          departmentName: 'Engineering',
          joiningDate: new Date('2023-08-01'),
          employmentType: 'FULL_TIME',
          salary: { basicSalary: 110000, currency: 'USD' },
          status: 'ACTIVE',
          emergencyContact: { name: 'Elena Thorne', relationship: 'Sibling', phone: '+1 (555) 300-8888' }
        });

        // Update department manager
        engDept.managerId = emp2._id;
        await engDept.save();

        // Seed salary structure
        await SalaryStructure.create({
          businessId: bizObjId,
          employeeId: emp1._id,
          basicSalary: 85000,
          allowances: { hra: 12000, conveyance: 3000, medical: 2000, special: 4000, other: 0 },
          deductions: { pf: 3500, tax: 8500, insurance: 1500, other: 0 },
          currency: 'USD'
        });

        await SalaryStructure.create({
          businessId: bizObjId,
          employeeId: emp2._id,
          basicSalary: 110000,
          allowances: { hra: 18000, conveyance: 4000, medical: 3000, special: 6000, other: 0 },
          deductions: { pf: 5000, tax: 14000, insurance: 2000, other: 0 },
          currency: 'USD'
        });

        // Seed sample job opening
        await JobOpening.create({
          businessId: bizObjId,
          departmentId: engDept._id,
          title: 'Senior DevOps Specialist',
          description: 'Lead Kubernetes, CI/CD and multi-cloud architectural automation.',
          qualifications: ['Kubernetes', 'Terraform', 'AWS/GCP', 'TypeScript/Go'],
          experienceYears: 4,
          salaryRange: { min: 95000, max: 130000, currency: 'USD' },
          employmentType: 'FULL_TIME',
          positionsCount: 2,
          status: 'ACTIVE'
        });
      }
    }
  } catch (err) {
    logger.warn('Error during HR demo seeding (will use fallback store if needed):', { error: String(err) });
  }

  // Also seed in-memory fallback store
  if (memDepartments.size === 0) {
    const d1Id = 'dep_001';
    const d2Id = 'dep_002';
    const e1Id = 'emp_001';
    const e2Id = 'emp_002';

    memDepartments.set(d1Id, {
      _id: d1Id,
      businessId: bizId,
      name: 'Engineering',
      code: 'ENG',
      description: 'Core software development & infrastructure',
      budget: 150000,
      managerId: e2Id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    memDepartments.set(d2Id, {
      _id: d2Id,
      businessId: bizId,
      name: 'Human Resources',
      code: 'HR',
      description: 'Talent acquisition, culture and compliance',
      budget: 45000,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    memEmployees.set(e1Id, {
      _id: e1Id,
      businessId: bizId,
      employeeId: 'EMP-1001',
      fullName: 'Sophia Lin',
      email: 'employee@nexuscorp.com',
      phone: '+1 (555) 400-0004',
      designation: 'Senior Full Stack Engineer',
      departmentId: d1Id,
      departmentName: 'Engineering',
      joiningDate: new Date('2024-03-15'),
      employmentType: 'FULL_TIME',
      salary: { basicSalary: 85000, currency: 'USD' },
      status: 'ACTIVE',
      emergencyContact: { name: 'Kevin Lin', relationship: 'Spouse', phone: '+1 (555) 400-9999' },
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    memEmployees.set(e2Id, {
      _id: e2Id,
      businessId: bizId,
      employeeId: 'EMP-1002',
      fullName: 'Marcus Thorne',
      email: 'manager@nexuscorp.com',
      phone: '+1 (555) 300-0003',
      designation: 'Engineering Manager',
      departmentId: d1Id,
      departmentName: 'Engineering',
      joiningDate: new Date('2023-08-01'),
      employmentType: 'FULL_TIME',
      salary: { basicSalary: 110000, currency: 'USD' },
      status: 'ACTIVE',
      emergencyContact: { name: 'Elena Thorne', relationship: 'Sibling', phone: '+1 (555) 300-8888' },
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    memLeavePolicies.set(bizId, {
      _id: 'lp_001',
      businessId: bizId,
      casualLeaveQuota: 12,
      sickLeaveQuota: 10,
      earnedLeaveQuota: 15,
      unpaidLeaveAllowed: true,
      carryForwardLimit: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    memSalaryStructures.set(`${bizId}_${e1Id}`, {
      _id: 'ss_001',
      businessId: bizId,
      employeeId: e1Id,
      basicSalary: 85000,
      allowances: { hra: 12000, conveyance: 3000, medical: 2000, special: 4000, other: 0 },
      deductions: { pf: 3500, tax: 8500, insurance: 1500, other: 0 },
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    memJobOpenings.set('job_001', {
      _id: 'job_001',
      businessId: bizId,
      departmentId: d1Id,
      title: 'Senior DevOps Specialist',
      description: 'Lead Kubernetes, CI/CD and multi-cloud architectural automation.',
      qualifications: ['Kubernetes', 'Terraform', 'AWS/GCP', 'TypeScript/Go'],
      experienceYears: 4,
      salaryRange: { min: 95000, max: 130000, currency: 'USD' },
      employmentType: 'FULL_TIME',
      positionsCount: 2,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

export class HRService {
  /**
   * Helper: log activity
   */
  private static async logActivity(businessId: string, userId: string | null, action: string, description: string, metadata?: any) {
    try {
      if (isDbConnected()) {
        await ActivityLog.create({
          businessId: new Types.ObjectId(businessId),
          userId: userId ? new Types.ObjectId(userId) : null,
          action,
          description,
          module: 'HR',
          metadata,
          timestamp: new Date()
        });
      }
    } catch (e) {
      // Non-critical logging error
    }
  }

  /**
   * ============================================================================
   * MODULE 1: EMPLOYEE MANAGEMENT
   * ============================================================================
   */

  static async listEmployees(
    businessId: string,
    filters: {
      search?: string;
      departmentId?: string;
      status?: string;
      employmentType?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    await seedDemoHRIfEmpty(businessId);
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };

      if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [{ fullName: regex }, { email: regex }, { employeeId: regex }, { designation: regex }];
      }

      if (filters.departmentId) {
        query.departmentId = new Types.ObjectId(filters.departmentId);
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.employmentType) {
        query.employmentType = filters.employmentType;
      }

      const [employees, total] = await Promise.all([
        Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Employee.countDocuments(query)
      ]);

      return {
        employees,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    // In-memory fallback
    let list = Array.from(memEmployees.values()).filter((e) => e.businessId === businessId);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.fullName?.toLowerCase().includes(s) ||
          e.email?.toLowerCase().includes(s) ||
          e.employeeId?.toLowerCase().includes(s) ||
          e.designation?.toLowerCase().includes(s)
      );
    }
    if (filters.departmentId) {
      list = list.filter((e) => String(e.departmentId) === String(filters.departmentId));
    }
    if (filters.status) {
      list = list.filter((e) => e.status === filters.status);
    }
    if (filters.employmentType) {
      list = list.filter((e) => e.employmentType === filters.employmentType);
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);

    return {
      employees: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async createEmployee(businessId: string, input: IEmployeeInput, actorUserId?: string) {
    await seedDemoHRIfEmpty(businessId);
    const cleanEmail = input.email.trim().toLowerCase();

    // Check duplicate employee email within business
    if (isDbConnected()) {
      const existing = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        email: cleanEmail
      });
      if (existing) {
        throw new Error(`An employee with email '${cleanEmail}' already exists in this business.`);
      }

      // Department lookup
      let deptName = '';
      if (input.departmentId) {
        const dept = await Department.findById(input.departmentId);
        if (dept) deptName = dept.name;
      }

      // Generate sequential Employee ID
      const count = await Employee.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const empIdStr = `EMP-${1000 + count + 1}`;

      // Create or locate associated user account
      let linkedUser = await User.findOne({ email: cleanEmail });
      if (!linkedUser) {
        const passwordToHash = input.initialPassword || 'Welcome@123';
        linkedUser = await resilientAuthStore.createUser({
          name: input.fullName,
          email: cleanEmail,
          phone: input.phone || '',
          password: passwordToHash,
          role: 'EMPLOYEE',
          businessId
        }) as any;
      }

      const newEmployee = await Employee.create({
        businessId: new Types.ObjectId(businessId),
        userId: linkedUser?._id,
        employeeId: empIdStr,
        fullName: input.fullName,
        profilePhoto: input.profilePhoto || null,
        email: cleanEmail,
        phone: input.phone,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        address: input.address,
        departmentId: input.departmentId ? new Types.ObjectId(input.departmentId) : undefined,
        departmentName: deptName,
        designation: input.designation,
        joiningDate: new Date(input.joiningDate),
        employmentType: input.employmentType || 'FULL_TIME',
        salary: {
          basicSalary: input.salary.basicSalary,
          currency: input.salary.currency || 'INR'
        },
        emergencyContact: input.emergencyContact,
        status: 'ACTIVE',
        documents: []
      });

      // Default Salary Structure
      const basic = input.salary.basicSalary;
      await SalaryStructure.findOneAndUpdate(
        { businessId: new Types.ObjectId(businessId), employeeId: newEmployee._id },
        {
          basicSalary: basic,
          allowances: {
            hra: Math.round(basic * 0.4),
            conveyance: Math.round(basic * 0.05),
            medical: Math.round(basic * 0.03),
            special: Math.round(basic * 0.05),
            other: 0
          },
          deductions: {
            pf: Math.round(basic * 0.12),
            tax: Math.round(basic * 0.1),
            insurance: 1000,
            other: 0
          },
          currency: input.salary.currency || 'INR'
        },
        { upsert: true, new: true }
      );

      // Notification
      await this.createNotification(
        businessId,
        actorUserId || null,
        'Employee Onboarded',
        `New employee ${input.fullName} (${empIdStr}) has been successfully added.`,
        'EMPLOYEE',
        { employeeId: newEmployee._id }
      );

      await this.logActivity(businessId, actorUserId || null, 'EMPLOYEE_CREATED', `Created employee ${input.fullName}`, {
        employeeId: newEmployee._id
      });

      return newEmployee;
    }

    // In-memory fallback
    const memExisting = Array.from(memEmployees.values()).find(
      (e) => e.businessId === businessId && e.email === cleanEmail
    );
    if (memExisting) {
      throw new Error(`An employee with email '${cleanEmail}' already exists in this business.`);
    }

    const newId = `emp_${Date.now()}`;
    const empIdStr = `EMP-${1000 + memEmployees.size + 1}`;
    let deptName = '';
    if (input.departmentId && memDepartments.has(input.departmentId)) {
      deptName = memDepartments.get(input.departmentId).name;
    }

    // Create user in fallback store
    const user = await resilientAuthStore.createUser({
      name: input.fullName,
      email: cleanEmail,
      phone: input.phone || '',
      password: input.initialPassword || 'Welcome@123',
      role: 'EMPLOYEE',
      businessId
    });

    const createdEmp = {
      _id: newId,
      businessId,
      userId: user._id,
      employeeId: empIdStr,
      fullName: input.fullName,
      profilePhoto: input.profilePhoto || null,
      email: cleanEmail,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      address: input.address,
      departmentId: input.departmentId,
      departmentName: deptName,
      designation: input.designation,
      joiningDate: new Date(input.joiningDate),
      employmentType: input.employmentType || 'FULL_TIME',
      salary: {
        basicSalary: input.salary.basicSalary,
        currency: input.salary.currency || 'INR'
      },
      emergencyContact: input.emergencyContact,
      status: 'ACTIVE',
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memEmployees.set(newId, createdEmp);

    // Default memory salary structure
    memSalaryStructures.set(`${businessId}_${newId}`, {
      _id: `ss_${Date.now()}`,
      businessId,
      employeeId: newId,
      basicSalary: input.salary.basicSalary,
      allowances: { hra: 4000, conveyance: 1000, medical: 500, special: 1000, other: 0 },
      deductions: { pf: 1800, tax: 2000, insurance: 500, other: 0 },
      currency: input.salary.currency || 'INR',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return createdEmp;
  }

  static async getEmployeeById(businessId: string, employeeId: string) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      let emp = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        $or: [
          ...(Types.ObjectId.isValid(employeeId) ? [{ _id: new Types.ObjectId(employeeId) }] : []),
          { employeeId }
        ]
      })
        .populate('departmentId')
        .populate('userId', 'email name role status lastLoginAt')
        .lean();

      if (!emp) {
        throw new Error('Employee not found.');
      }

      const salaryStructure = await SalaryStructure.findOne({
        businessId: new Types.ObjectId(businessId),
        employeeId: emp._id
      }).lean();

      // Recent attendance count
      const attendanceCount = await Attendance.countDocuments({
        businessId: new Types.ObjectId(businessId),
        employeeId: emp._id
      });

      // Recent leaves
      const leaveCount = await LeaveRequest.countDocuments({
        businessId: new Types.ObjectId(businessId),
        employeeId: emp._id
      });

      return {
        ...emp,
        salaryStructure,
        stats: {
          attendanceDays: attendanceCount,
          leavesRequested: leaveCount
        }
      };
    }

    // In-memory fallback
    const emp =
      memEmployees.get(employeeId) ||
      Array.from(memEmployees.values()).find(
        (e) => e.businessId === businessId && (e._id === employeeId || e.employeeId === employeeId)
      );

    if (!emp) {
      throw new Error('Employee not found.');
    }

    const salaryStructure = memSalaryStructures.get(`${businessId}_${emp._id}`) || null;

    return {
      ...emp,
      salaryStructure,
      stats: {
        attendanceDays: 0,
        leavesRequested: 0
      }
    };
  }

  static async updateEmployee(businessId: string, employeeId: string, updateInput: IEmployeeUpdateInput, actorUserId?: string) {
    if (isDbConnected()) {
      const emp = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        $or: [
          ...(Types.ObjectId.isValid(employeeId) ? [{ _id: new Types.ObjectId(employeeId) }] : []),
          { employeeId }
        ]
      });

      if (!emp) {
        throw new Error('Employee not found.');
      }

      if (updateInput.fullName) emp.fullName = updateInput.fullName;
      if (updateInput.phone !== undefined) emp.phone = updateInput.phone;
      if (updateInput.dateOfBirth) emp.dateOfBirth = new Date(updateInput.dateOfBirth);
      if (updateInput.address) emp.address = updateInput.address as any;
      if (updateInput.designation) emp.designation = updateInput.designation;
      if (updateInput.employmentType) emp.employmentType = updateInput.employmentType;
      if (updateInput.status) emp.status = updateInput.status;
      if (updateInput.emergencyContact) emp.emergencyContact = updateInput.emergencyContact;
      if (updateInput.profilePhoto !== undefined) emp.profilePhoto = updateInput.profilePhoto;

      if (updateInput.departmentId) {
        emp.departmentId = new Types.ObjectId(updateInput.departmentId);
        const dept = await Department.findById(updateInput.departmentId);
        if (dept) emp.departmentName = dept.name;
      }

      if (updateInput.salary?.basicSalary !== undefined) {
        emp.salary.basicSalary = updateInput.salary.basicSalary;
        if (updateInput.salary.currency) emp.salary.currency = updateInput.salary.currency;

        // Sync salary structure
        await SalaryStructure.findOneAndUpdate(
          { businessId: new Types.ObjectId(businessId), employeeId: emp._id },
          { basicSalary: updateInput.salary.basicSalary }
        );
      }

      await emp.save();

      // If user account is linked, sync name and status
      if (emp.userId) {
        const uStatus = emp.status === 'ACTIVE' ? 'active' : 'inactive';
        await User.findByIdAndUpdate(emp.userId, {
          name: emp.fullName,
          phone: emp.phone,
          status: uStatus
        });
      }

      await this.logActivity(businessId, actorUserId || null, 'EMPLOYEE_UPDATED', `Updated employee ${emp.fullName}`, {
        employeeId: emp._id
      });

      return emp;
    }

    // In-memory fallback
    const emp =
      memEmployees.get(employeeId) ||
      Array.from(memEmployees.values()).find(
        (e) => e.businessId === businessId && (e._id === employeeId || e.employeeId === employeeId)
      );

    if (!emp) throw new Error('Employee not found.');
    Object.assign(emp, updateInput);
    emp.updatedAt = new Date();
    return emp;
  }

  static async deleteEmployee(businessId: string, employeeId: string, actorUserId?: string) {
    if (isDbConnected()) {
      const emp = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        $or: [
          ...(Types.ObjectId.isValid(employeeId) ? [{ _id: new Types.ObjectId(employeeId) }] : []),
          { employeeId }
        ]
      });

      if (!emp) {
        throw new Error('Employee not found.');
      }

      // Safeguard check: cannot delete if attendance, leave, or payslip records exist
      const [attCount, leaveCount, payslipCount] = await Promise.all([
        Attendance.countDocuments({ businessId: new Types.ObjectId(businessId), employeeId: emp._id }),
        LeaveRequest.countDocuments({ businessId: new Types.ObjectId(businessId), employeeId: emp._id }),
        Payslip.countDocuments({ businessId: new Types.ObjectId(businessId), employeeId: emp._id })
      ]);

      if (attCount > 0 || leaveCount > 0 || payslipCount > 0) {
        throw new Error(
          `Cannot delete employee with existing records (${attCount} attendance, ${leaveCount} leaves, ${payslipCount} payslips). Please deactivate employee status instead to preserve historical integrity.`
        );
      }

      await Employee.findByIdAndDelete(emp._id);
      await SalaryStructure.deleteOne({ businessId: new Types.ObjectId(businessId), employeeId: emp._id });

      await this.logActivity(businessId, actorUserId || null, 'EMPLOYEE_DELETED', `Deleted employee ${emp.fullName}`);
      return { success: true, message: `Employee ${emp.fullName} removed successfully.` };
    }

    // In-memory fallback
    const emp = memEmployees.get(employeeId);
    if (!emp) throw new Error('Employee not found.');

    const attCount = Array.from(memAttendances.values()).filter(
      (a) => a.businessId === businessId && String(a.employeeId) === String(emp._id)
    ).length;
    const leaveCount = Array.from(memLeaveRequests.values()).filter(
      (l) => l.businessId === businessId && String(l.employeeId) === String(emp._id)
    ).length;
    const payslipCount = Array.from(memPayslips.values()).filter(
      (p) => p.businessId === businessId && String(p.employeeId) === String(emp._id)
    ).length;

    if (attCount > 0 || leaveCount > 0 || payslipCount > 0) {
      throw new Error(
        `Cannot delete employee with existing records (${attCount} attendance, ${leaveCount} leaves, ${payslipCount} payslips). Please deactivate employee status instead to preserve historical integrity.`
      );
    }

    memEmployees.delete(employeeId);
    return { success: true, message: 'Employee removed successfully.' };
  }

  static async toggleEmployeeStatus(businessId: string, employeeId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED', actorUserId?: string) {
    return this.updateEmployee(businessId, employeeId, { status }, actorUserId);
  }

  static async uploadDocument(businessId: string, employeeId: string, doc: IEmployeeDocumentUploadInput, actorUserId?: string) {
    if (isDbConnected()) {
      const emp = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        $or: [
          ...(Types.ObjectId.isValid(employeeId) ? [{ _id: new Types.ObjectId(employeeId) }] : []),
          { employeeId }
        ]
      });

      if (!emp) throw new Error('Employee not found.');

      emp.documents.push({
        name: doc.name,
        url: doc.url,
        fileType: doc.fileType,
        uploadedAt: new Date()
      });

      await emp.save();
      await this.logActivity(businessId, actorUserId || null, 'DOCUMENT_UPLOADED', `Uploaded document ${doc.name} for ${emp.fullName}`);
      return emp;
    }

    const emp = memEmployees.get(employeeId);
    if (!emp) throw new Error('Employee not found.');
    emp.documents.push({
      name: doc.name,
      url: doc.url,
      fileType: doc.fileType,
      uploadedAt: new Date()
    });
    return emp;
  }

  static async exportEmployees(businessId: string): Promise<string> {
    const { employees } = await this.listEmployees(businessId, { limit: 1000 });
    const header = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Employment Type', 'Status', 'Joining Date', 'Basic Salary'];
    const rows = employees.map((e: any) => [
      `"${e.employeeId || ''}"`,
      `"${e.fullName || ''}"`,
      `"${e.email || ''}"`,
      `"${e.phone || ''}"`,
      `"${e.departmentName || ''}"`,
      `"${e.designation || ''}"`,
      `"${e.employmentType || ''}"`,
      `"${e.status || ''}"`,
      `"${e.joiningDate ? new Date(e.joiningDate).toISOString().split('T')[0] : ''}"`,
      `"${e.salary?.basicSalary || 0} ${e.salary?.currency || 'INR'}"`
    ]);

    return [header.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
  }

  /**
   * ============================================================================
   * MODULE 2: DEPARTMENT MANAGEMENT
   * ============================================================================
   */

  static async listDepartments(businessId: string) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      const departments = await Department.find({ businessId: new Types.ObjectId(businessId) })
        .populate('managerId', 'fullName email employeeId')
        .sort({ name: 1 })
        .lean();

      // Aggregate employee count for each department
      const deptsWithCount = await Promise.all(
        departments.map(async (dept) => {
          const count = await Employee.countDocuments({
            businessId: new Types.ObjectId(businessId),
            departmentId: dept._id
          });
          return {
            ...dept,
            employeeCount: count
          };
        })
      );

      return deptsWithCount;
    }

    // In-memory fallback
    const list = Array.from(memDepartments.values()).filter((d) => d.businessId === businessId);
    return list.map((dept) => {
      const count = Array.from(memEmployees.values()).filter(
        (e) => e.businessId === businessId && String(e.departmentId) === String(dept._id)
      ).length;
      return {
        ...dept,
        employeeCount: count
      };
    });
  }

  static async createDepartment(businessId: string, input: IDepartmentInput, actorUserId?: string) {
    await seedDemoHRIfEmpty(businessId);
    const cleanCode = input.code.trim().toUpperCase();

    if (isDbConnected()) {
      const existing = await Department.findOne({
        businessId: new Types.ObjectId(businessId),
        code: cleanCode
      });
      if (existing) {
        throw new Error(`Department with code '${cleanCode}' already exists in this business.`);
      }

      const dept = await Department.create({
        businessId: new Types.ObjectId(businessId),
        name: input.name.trim(),
        code: cleanCode,
        description: input.description || '',
        managerId: input.managerId ? new Types.ObjectId(input.managerId) : undefined,
        budget: input.budget || 0,
        isActive: true
      });

      await this.logActivity(businessId, actorUserId || null, 'DEPARTMENT_CREATED', `Created department ${dept.name} (${dept.code})`);
      return dept;
    }

    const newId = `dep_${Date.now()}`;
    const newDept = {
      _id: newId,
      businessId,
      name: input.name.trim(),
      code: cleanCode,
      description: input.description || '',
      managerId: input.managerId,
      budget: input.budget || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memDepartments.set(newId, newDept);
    return newDept;
  }

  static async updateDepartment(businessId: string, departmentId: string, input: IDepartmentUpdateInput, actorUserId?: string) {
    if (isDbConnected()) {
      const dept = await Department.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(departmentId)
      });
      if (!dept) throw new Error('Department not found.');

      if (input.name) dept.name = input.name.trim();
      if (input.code) dept.code = input.code.trim().toUpperCase();
      if (input.description !== undefined) dept.description = input.description;
      if (input.managerId !== undefined) {
        dept.managerId = input.managerId ? new Types.ObjectId(input.managerId) : undefined;
      }
      if (input.budget !== undefined) dept.budget = input.budget;
      if (input.isActive !== undefined) dept.isActive = input.isActive;

      await dept.save();

      // If department name updated, sync to employees in this department
      if (input.name) {
        await Employee.updateMany(
          { businessId: new Types.ObjectId(businessId), departmentId: dept._id },
          { departmentName: dept.name }
        );
      }

      await this.logActivity(businessId, actorUserId || null, 'DEPARTMENT_UPDATED', `Updated department ${dept.name}`);
      return dept;
    }

    const dept = memDepartments.get(departmentId);
    if (!dept) throw new Error('Department not found.');
    Object.assign(dept, input);
    dept.updatedAt = new Date();
    return dept;
  }

  static async deleteDepartment(businessId: string, departmentId: string, actorUserId?: string) {
    if (isDbConnected()) {
      const dept = await Department.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(departmentId)
      });
      if (!dept) throw new Error('Department not found.');

      // Safeguard: Check if employees are assigned to this department
      const employeeCount = await Employee.countDocuments({
        businessId: new Types.ObjectId(businessId),
        departmentId: dept._id
      });

      if (employeeCount > 0) {
        throw new Error(
          `Cannot delete department '${dept.name}'. There are currently ${employeeCount} active employee(s) assigned to this department. Please reassign them first.`
        );
      }

      await Department.findByIdAndDelete(dept._id);
      await this.logActivity(businessId, actorUserId || null, 'DEPARTMENT_DELETED', `Deleted department ${dept.name}`);
      return { success: true, message: `Department '${dept.name}' deleted successfully.` };
    }

    const dept = memDepartments.get(departmentId);
    if (!dept) throw new Error('Department not found.');
    memDepartments.delete(departmentId);
    return { success: true, message: 'Department deleted successfully.' };
  }

  static async assignDepartmentManager(businessId: string, departmentId: string, managerId: string, actorUserId?: string) {
    return this.updateDepartment(businessId, departmentId, { managerId }, actorUserId);
  }

  static async assignEmployeesToDepartment(businessId: string, departmentId: string, employeeIds: string[], actorUserId?: string) {
    if (isDbConnected()) {
      const dept = await Department.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(departmentId)
      });
      if (!dept) throw new Error('Department not found.');

      const objectIds = employeeIds.map((id) => new Types.ObjectId(id));
      await Employee.updateMany(
        { businessId: new Types.ObjectId(businessId), _id: { $in: objectIds } },
        { departmentId: dept._id, departmentName: dept.name }
      );

      await this.logActivity(businessId, actorUserId || null, 'EMPLOYEES_ASSIGNED', `Assigned ${employeeIds.length} employees to ${dept.name}`);
      return { success: true, count: employeeIds.length };
    }

    const dept = memDepartments.get(departmentId);
    if (!dept) throw new Error('Department not found.');

    employeeIds.forEach((id) => {
      const emp = memEmployees.get(id);
      if (emp) {
        emp.departmentId = departmentId;
        emp.departmentName = dept.name;
      }
    });

    return { success: true, count: employeeIds.length };
  }

  static async getDepartmentStatistics(businessId: string) {
    const depts = await this.listDepartments(businessId);
    const totalDepartments = depts.length;
    const activeDepartments = depts.filter((d: any) => d.isActive).length;
    const totalBudget = depts.reduce((sum: number, d: any) => sum + (d.budget || 0), 0);
    const totalEmployees = depts.reduce((sum: number, d: any) => sum + (d.employeeCount || 0), 0);

    return {
      totalDepartments,
      activeDepartments,
      totalBudget,
      totalEmployees,
      departmentDistribution: depts.map((d: any) => ({
        id: d._id,
        name: d.name,
        code: d.code,
        employeeCount: d.employeeCount,
        budget: d.budget
      }))
    };
  }

  /**
   * ============================================================================
   * MODULE 3: ATTENDANCE MANAGEMENT
   * ============================================================================
   */

  private static getTodayDateOnly(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  }

  static async checkIn(businessId: string, actorUserId: string, input: IAttendanceCheckInInput = {}) {
    await seedDemoHRIfEmpty(businessId);
    const today = this.getTodayDateOnly();
    const now = new Date();

    // 1. Locate the employee record for this user
    let employeeDoc: any = null;
    if (isDbConnected()) {
      employeeDoc = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        userId: new Types.ObjectId(actorUserId)
      });

      // Fallback: if not found by userId, check if actorUserId is direct employeeId
      if (!employeeDoc && Types.ObjectId.isValid(actorUserId)) {
        employeeDoc = await Employee.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: new Types.ObjectId(actorUserId)
        });
      }

      if (!employeeDoc) {
        throw new Error('Employee profile not found for this user account.');
      }

      // 2. Prevent duplicate check-in
      const existing = await Attendance.findOne({
        businessId: new Types.ObjectId(businessId),
        employeeId: employeeDoc._id,
        date: today
      });

      if (existing) {
        throw new Error('Attendance check-in already recorded for today.');
      }

      // 3. Late Arrival Tracking: standard working start is 09:30 AM local
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const standardStartMinutes = 9 * 60 + 30; // 09:30 AM
      const currentMinutes = hours * 60 + minutes;
      const lateMinutes = Math.max(0, currentMinutes - standardStartMinutes);
      const status: AttendanceStatus = lateMinutes > 0 ? 'LATE' : 'PRESENT';

      const attendance = await Attendance.create({
        businessId: new Types.ObjectId(businessId),
        employeeId: employeeDoc._id,
        userId: new Types.ObjectId(actorUserId),
        date: today,
        checkIn: now,
        workingHours: 0,
        status,
        lateMinutes,
        ipAddress: input.ipAddress,
        notes: input.notes
      });

      await this.logActivity(businessId, actorUserId, 'ATTENDANCE_CHECK_IN', `${employeeDoc.fullName} checked in (${status})`);
      return attendance;
    }

    // In-memory fallback
    const emp = Array.from(memEmployees.values()).find(
      (e) => e.businessId === businessId && (String(e.userId) === String(actorUserId) || String(e._id) === String(actorUserId))
    );
    if (!emp) throw new Error('Employee profile not found for this user account.');

    const dateKey = `${businessId}_${emp._id}_${today.toISOString().split('T')[0]}`;
    if (memAttendances.has(dateKey)) {
      throw new Error('Attendance check-in already recorded for today.');
    }

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const standardStartMinutes = 9 * 60 + 30;
    const currentMinutes = hours * 60 + minutes;
    const lateMinutes = Math.max(0, currentMinutes - standardStartMinutes);
    const status: AttendanceStatus = lateMinutes > 0 ? 'LATE' : 'PRESENT';

    const attRecord = {
      _id: `att_${Date.now()}`,
      businessId,
      employeeId: emp._id,
      userId: actorUserId,
      date: today,
      checkIn: now,
      checkOut: null,
      workingHours: 0,
      status,
      lateMinutes,
      notes: input.notes,
      createdAt: now,
      updatedAt: now
    };

    memAttendances.set(dateKey, attRecord);
    return attRecord;
  }

  static async checkOut(businessId: string, actorUserId: string, input: IAttendanceCheckOutInput = {}) {
    const today = this.getTodayDateOnly();
    const now = new Date();

    if (isDbConnected()) {
      let employeeDoc: any = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        userId: new Types.ObjectId(actorUserId)
      });

      if (!employeeDoc && Types.ObjectId.isValid(actorUserId)) {
        employeeDoc = await Employee.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: new Types.ObjectId(actorUserId)
        });
      }

      if (!employeeDoc) throw new Error('Employee profile not found.');

      const attendance = await Attendance.findOne({
        businessId: new Types.ObjectId(businessId),
        employeeId: employeeDoc._id,
        date: today
      });

      if (!attendance) {
        throw new Error('No check-in record found for today. Please check in first.');
      }

      if (attendance.checkOut) {
        throw new Error('Attendance check-out has already been submitted for today.');
      }

      if (!attendance.checkIn) {
        throw new Error('Invalid attendance state: check-in timestamp is missing.');
      }

      // Calculate working hours
      const diffMs = now.getTime() - attendance.checkIn.getTime();
      if (diffMs < 0) {
        throw new Error('Checkout time cannot precede check-in time.');
      }

      const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      attendance.checkOut = now;
      attendance.workingHours = hoursWorked;

      // If working hours < 4, adjust status to HALF_DAY unless on leave
      if (hoursWorked < 4 && attendance.status !== 'ON_LEAVE') {
        attendance.status = 'HALF_DAY';
      }

      if (input.notes) {
        attendance.notes = attendance.notes ? `${attendance.notes}; ${input.notes}` : input.notes;
      }

      await attendance.save();
      await this.logActivity(businessId, actorUserId, 'ATTENDANCE_CHECK_OUT', `${employeeDoc.fullName} checked out (${hoursWorked} hrs)`);
      return attendance;
    }

    // In-memory fallback
    const emp = Array.from(memEmployees.values()).find(
      (e) => e.businessId === businessId && (String(e.userId) === String(actorUserId) || String(e._id) === String(actorUserId))
    );
    if (!emp) throw new Error('Employee profile not found.');

    const dateKey = `${businessId}_${emp._id}_${today.toISOString().split('T')[0]}`;
    const attRecord = memAttendances.get(dateKey);
    if (!attRecord) throw new Error('No check-in record found for today. Please check in first.');
    if (attRecord.checkOut) throw new Error('Attendance check-out has already been submitted for today.');

    const diffMs = now.getTime() - new Date(attRecord.checkIn).getTime();
    const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    attRecord.checkOut = now;
    attRecord.workingHours = hoursWorked;
    if (hoursWorked < 4) attRecord.status = 'HALF_DAY';
    attRecord.updatedAt = now;

    return attRecord;
  }

  static async getTodayAttendance(businessId: string, actorUserId: string) {
    const today = this.getTodayDateOnly();

    if (isDbConnected()) {
      let emp: any = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        userId: new Types.ObjectId(actorUserId)
      });
      if (!emp && Types.ObjectId.isValid(actorUserId)) {
        emp = await Employee.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: new Types.ObjectId(actorUserId)
        });
      }
      if (!emp) return null;

      const record = await Attendance.findOne({
        businessId: new Types.ObjectId(businessId),
        employeeId: emp._id,
        date: today
      }).lean();

      return record;
    }

    const emp = Array.from(memEmployees.values()).find(
      (e) => e.businessId === businessId && (String(e.userId) === String(actorUserId) || String(e._id) === String(actorUserId))
    );
    if (!emp) return null;

    const dateKey = `${businessId}_${emp._id}_${today.toISOString().split('T')[0]}`;
    return memAttendances.get(dateKey) || null;
  }

  static async listAttendance(businessId: string, filters: IAttendanceFilter = {}) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };

      if (filters.employeeId) {
        query.employeeId = new Types.ObjectId(filters.employeeId);
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = new Date(filters.startDate);
        if (filters.endDate) query.date.$lte = new Date(filters.endDate);
      }

      const list = await Attendance.find(query)
        .populate('employeeId', 'fullName employeeId departmentName designation')
        .sort({ date: -1, checkIn: -1 })
        .limit(500)
        .lean();

      return list;
    }

    // In-memory fallback
    let list = Array.from(memAttendances.values()).filter((a) => a.businessId === businessId);
    if (filters.employeeId) list = list.filter((a) => String(a.employeeId) === String(filters.employeeId));
    if (filters.status) list = list.filter((a) => a.status === filters.status);
    return list;
  }

  static async getAttendanceCalendar(businessId: string, employeeId: string, month: number, year: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const records = await this.listAttendance(businessId, {
      employeeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const calendarMap: Record<string, any> = {};
    records.forEach((r: any) => {
      const d = new Date(r.date).toISOString().split('T')[0];
      calendarMap[d] = r;
    });

    return {
      month,
      year,
      calendarMap,
      summary: {
        totalDays: Object.keys(calendarMap).length,
        present: records.filter((r: any) => r.status === 'PRESENT').length,
        late: records.filter((r: any) => r.status === 'LATE').length,
        halfDay: records.filter((r: any) => r.status === 'HALF_DAY').length,
        onLeave: records.filter((r: any) => r.status === 'ON_LEAVE').length,
        absent: records.filter((r: any) => r.status === 'ABSENT').length
      }
    };
  }

  /**
   * ============================================================================
   * MODULE 4: LEAVE MANAGEMENT
   * ============================================================================
   */

  static async getLeavePolicy(businessId: string) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      let policy: any = await LeavePolicy.findOne({ businessId: new Types.ObjectId(businessId) }).lean();
      if (!policy) {
        const created = await LeavePolicy.create({
          businessId: new Types.ObjectId(businessId),
          casualLeaveQuota: 12,
          sickLeaveQuota: 10,
          earnedLeaveQuota: 15,
          unpaidLeaveAllowed: true,
          carryForwardLimit: 5
        });
        policy = created.toObject();
      }
      return policy;
    }

    return (
      memLeavePolicies.get(businessId) || {
        businessId,
        casualLeaveQuota: 12,
        sickLeaveQuota: 10,
        earnedLeaveQuota: 15,
        unpaidLeaveAllowed: true,
        carryForwardLimit: 5
      }
    );
  }

  static async updateLeavePolicy(businessId: string, input: ILeavePolicyInput, actorUserId?: string) {
    if (isDbConnected()) {
      const policy = await LeavePolicy.findOneAndUpdate(
        { businessId: new Types.ObjectId(businessId) },
        { $set: input },
        { upsert: true, new: true }
      );
      await this.logActivity(businessId, actorUserId || null, 'LEAVE_POLICY_UPDATED', 'Updated business leave policies');
      return policy;
    }

    let policy = memLeavePolicies.get(businessId);
    if (!policy) {
      policy = { businessId, ...input };
    } else {
      Object.assign(policy, input);
    }
    memLeavePolicies.set(businessId, policy);
    return policy;
  }

  static async getEmployeeLeaveBalance(businessId: string, employeeId: string) {
    const policy: any = await this.getLeavePolicy(businessId);
    const startOfYear = new Date(Date.UTC(new Date().getFullYear(), 0, 1));
    const endOfYear = new Date(Date.UTC(new Date().getFullYear(), 11, 31, 23, 59, 59));

    let approvedLeaves: any[] = [];
    if (isDbConnected()) {
      approvedLeaves = await LeaveRequest.find({
        businessId: new Types.ObjectId(businessId),
        employeeId: new Types.ObjectId(employeeId),
        status: 'APPROVED',
        startDate: { $gte: startOfYear, $lte: endOfYear }
      }).lean();
    } else {
      approvedLeaves = Array.from(memLeaveRequests.values()).filter(
        (l) => l.businessId === businessId && String(l.employeeId) === String(employeeId) && l.status === 'APPROVED'
      );
    }

    const usedCasual = approvedLeaves.filter((l) => l.leaveType === 'CASUAL_LEAVE').reduce((sum, l) => sum + (l.daysCount || 0), 0);
    const usedSick = approvedLeaves.filter((l) => l.leaveType === 'SICK_LEAVE').reduce((sum, l) => sum + (l.daysCount || 0), 0);
    const usedEarned = approvedLeaves.filter((l) => l.leaveType === 'EARNED_LEAVE').reduce((sum, l) => sum + (l.daysCount || 0), 0);
    const usedUnpaid = approvedLeaves.filter((l) => l.leaveType === 'UNPAID_LEAVE').reduce((sum, l) => sum + (l.daysCount || 0), 0);

    return {
      casual: { quota: policy.casualLeaveQuota, used: usedCasual, remaining: Math.max(0, policy.casualLeaveQuota - usedCasual) },
      sick: { quota: policy.sickLeaveQuota, used: usedSick, remaining: Math.max(0, policy.sickLeaveQuota - usedSick) },
      earned: { quota: policy.earnedLeaveQuota, used: usedEarned, remaining: Math.max(0, policy.earnedLeaveQuota - usedEarned) },
      unpaid: { quota: policy.unpaidLeaveAllowed ? 'Unlimited' : 0, used: usedUnpaid, remaining: 'N/A' }
    };
  }

  static async applyLeave(businessId: string, actorUserId: string, input: ILeaveRequestInput) {
    await seedDemoHRIfEmpty(businessId);
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (endDate < startDate) {
      throw new Error('Leave end date cannot be earlier than start date.');
    }

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays <= 0) {
      throw new Error('Invalid leave duration.');
    }

    let employeeDoc: any = null;
    if (isDbConnected()) {
      employeeDoc = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        userId: new Types.ObjectId(actorUserId)
      });
      if (!employeeDoc && Types.ObjectId.isValid(actorUserId)) {
        employeeDoc = await Employee.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: new Types.ObjectId(actorUserId)
        });
      }
    } else {
      employeeDoc = Array.from(memEmployees.values()).find(
        (e) => e.businessId === businessId && (String(e.userId) === String(actorUserId) || String(e._id) === String(actorUserId))
      );
    }

    if (!employeeDoc) throw new Error('Employee profile not found.');

    // Balance check
    const balances: any = await this.getEmployeeLeaveBalance(businessId, employeeDoc._id);
    if (input.leaveType === 'CASUAL_LEAVE' && diffDays > balances.casual.remaining) {
      throw new Error(`Insufficient casual leave balance (${balances.casual.remaining} remaining, applied for ${diffDays}).`);
    }
    if (input.leaveType === 'SICK_LEAVE' && diffDays > balances.sick.remaining) {
      throw new Error(`Insufficient sick leave balance (${balances.sick.remaining} remaining, applied for ${diffDays}).`);
    }
    if (input.leaveType === 'EARNED_LEAVE' && diffDays > balances.earned.remaining) {
      throw new Error(`Insufficient earned leave balance (${balances.earned.remaining} remaining, applied for ${diffDays}).`);
    }

    if (isDbConnected()) {
      const leave = await LeaveRequest.create({
        businessId: new Types.ObjectId(businessId),
        employeeId: employeeDoc._id,
        userId: new Types.ObjectId(actorUserId),
        leaveType: input.leaveType,
        startDate,
        endDate,
        daysCount: diffDays,
        reason: input.reason.trim(),
        status: 'PENDING'
      });

      // Notification to Owner/Managers
      await this.createNotification(
        businessId,
        null,
        'Leave Application Submitted',
        `${employeeDoc.fullName} submitted a ${diffDays}-day ${input.leaveType} application.`,
        'LEAVE',
        { leaveRequestId: leave._id }
      );

      await this.logActivity(businessId, actorUserId, 'LEAVE_APPLIED', `${employeeDoc.fullName} applied for ${diffDays} day(s) leave`);
      return leave;
    }

    // In-memory fallback
    const newId = `leave_${Date.now()}`;
    const newLeave = {
      _id: newId,
      businessId,
      employeeId: employeeDoc._id,
      userId: actorUserId,
      leaveType: input.leaveType,
      startDate,
      endDate,
      daysCount: diffDays,
      reason: input.reason.trim(),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memLeaveRequests.set(newId, newLeave);
    return newLeave;
  }

  static async listLeaveRequests(businessId: string, filters: { employeeId?: string; status?: string } = {}) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.employeeId) query.employeeId = new Types.ObjectId(filters.employeeId);
      if (filters.status) query.status = filters.status;

      const list = await LeaveRequest.find(query)
        .populate('employeeId', 'fullName employeeId departmentName designation')
        .sort({ createdAt: -1 })
        .lean();

      return list;
    }

    let list = Array.from(memLeaveRequests.values()).filter((l) => l.businessId === businessId);
    if (filters.employeeId) list = list.filter((l) => String(l.employeeId) === String(filters.employeeId));
    if (filters.status) list = list.filter((l) => l.status === filters.status);
    return list;
  }

  static async reviewLeave(
    businessId: string,
    leaveRequestId: string,
    reviewerUserId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ) {
    if (action === 'REJECT' && !rejectionReason) {
      throw new Error('Rejection reason is required when rejecting a leave application.');
    }

    if (isDbConnected()) {
      const leave = await LeaveRequest.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(leaveRequestId)
      }).populate('employeeId');

      if (!leave) throw new Error('Leave request not found.');
      if (leave.status !== 'PENDING') {
        throw new Error(`Cannot review leave request with status '${leave.status}'.`);
      }

      leave.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      leave.reviewedBy = new Types.ObjectId(reviewerUserId);
      leave.reviewedAt = new Date();
      if (action === 'REJECT') leave.rejectionReason = rejectionReason;

      await leave.save();

      // If approved, automatically update Attendance records as ON_LEAVE for that date span
      if (action === 'APPROVE') {
        const curr = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        while (curr <= end) {
          const dateOnly = new Date(Date.UTC(curr.getUTCFullYear(), curr.getUTCMonth(), curr.getUTCDate()));
          await Attendance.findOneAndUpdate(
            { businessId: new Types.ObjectId(businessId), employeeId: leave.employeeId, date: dateOnly },
            {
              $setOnInsert: {
                businessId: new Types.ObjectId(businessId),
                employeeId: leave.employeeId,
                userId: leave.userId,
                date: dateOnly,
                workingHours: 0,
                status: 'ON_LEAVE'
              }
            },
            { upsert: true }
          );
          curr.setDate(curr.getDate() + 1);
        }
      }

      // Notify the employee
      const emp: any = leave.employeeId;
      if (emp?.userId) {
        await this.createNotification(
          businessId,
          emp.userId.toString(),
          `Leave Request ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`,
          `Your leave request for ${leave.daysCount} day(s) from ${new Date(leave.startDate).toISOString().split('T')[0]} has been ${leave.status.toLowerCase()}.${action === 'REJECT' ? ' Reason: ' + rejectionReason : ''}`,
          'LEAVE',
          { leaveRequestId: leave._id }
        );
      }

      await this.logActivity(businessId, reviewerUserId, 'LEAVE_REVIEWED', `${action} leave request for ${emp?.fullName || 'employee'}`);
      return leave;
    }

    // In-memory fallback
    const leave = memLeaveRequests.get(leaveRequestId);
    if (!leave) throw new Error('Leave request not found.');
    leave.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    leave.reviewedBy = reviewerUserId;
    leave.reviewedAt = new Date();
    if (action === 'REJECT') leave.rejectionReason = rejectionReason;
    return leave;
  }

  static async cancelLeave(businessId: string, leaveRequestId: string, actorUserId: string) {
    if (isDbConnected()) {
      const leave = await LeaveRequest.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(leaveRequestId)
      });
      if (!leave) throw new Error('Leave request not found.');
      if (leave.status !== 'PENDING') {
        throw new Error('Only PENDING leave requests can be cancelled.');
      }
      leave.status = 'CANCELLED';
      await leave.save();
      return leave;
    }

    const leave = memLeaveRequests.get(leaveRequestId);
    if (!leave) throw new Error('Leave request not found.');
    leave.status = 'CANCELLED';
    return leave;
  }

  /**
   * ============================================================================
   * MODULE 5: RECRUITMENT MANAGEMENT
   * ============================================================================
   */

  static async listJobOpenings(businessId: string, filters: { departmentId?: string; status?: string } = {}) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.departmentId) query.departmentId = new Types.ObjectId(filters.departmentId);
      if (filters.status) query.status = filters.status;

      const openings = await JobOpening.find(query).populate('departmentId', 'name code').sort({ createdAt: -1 }).lean();

      // Aggregate application counts
      const openingsWithCount = await Promise.all(
        openings.map(async (op) => {
          const appCount = await JobApplication.countDocuments({
            businessId: new Types.ObjectId(businessId),
            jobOpeningId: op._id
          });
          return { ...op, applicationsCount: appCount };
        })
      );

      return openingsWithCount;
    }

    let list = Array.from(memJobOpenings.values()).filter((j) => j.businessId === businessId);
    if (filters.status) list = list.filter((j) => j.status === filters.status);
    return list.map((j) => ({ ...j, applicationsCount: 0 }));
  }

  static async createJobOpening(businessId: string, input: IJobOpeningInput, actorUserId?: string) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      const opening = await JobOpening.create({
        businessId: new Types.ObjectId(businessId),
        departmentId: new Types.ObjectId(input.departmentId),
        title: input.title.trim(),
        description: input.description.trim(),
        qualifications: input.qualifications,
        experienceYears: input.experienceYears,
        salaryRange: input.salaryRange,
        employmentType: input.employmentType,
        positionsCount: input.positionsCount,
        status: input.status || 'ACTIVE'
      });

      await this.logActivity(businessId, actorUserId || null, 'JOB_OPENING_CREATED', `Created job posting ${opening.title}`);
      return opening;
    }

    const newId = `job_${Date.now()}`;
    const newOpening = {
      _id: newId,
      businessId,
      ...input,
      status: input.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memJobOpenings.set(newId, newOpening);
    return newOpening;
  }

  static async updateJobOpening(businessId: string, openingId: string, input: Partial<IJobOpeningInput>, actorUserId?: string) {
    if (isDbConnected()) {
      const opening = await JobOpening.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(openingId)
      });
      if (!opening) throw new Error('Job opening not found.');

      if (input.title) opening.title = input.title;
      if (input.description) opening.description = input.description;
      if (input.qualifications) opening.qualifications = input.qualifications;
      if (input.experienceYears !== undefined) opening.experienceYears = input.experienceYears;
      if (input.salaryRange) opening.salaryRange = input.salaryRange as any;
      if (input.employmentType) opening.employmentType = input.employmentType;
      if (input.positionsCount !== undefined) opening.positionsCount = input.positionsCount;
      if (input.status) opening.status = input.status;

      await opening.save();
      return opening;
    }

    const opening = memJobOpenings.get(openingId);
    if (!opening) throw new Error('Job opening not found.');
    Object.assign(opening, input);
    return opening;
  }

  static async deleteJobOpening(businessId: string, openingId: string, actorUserId?: string) {
    if (isDbConnected()) {
      await JobOpening.deleteOne({ businessId: new Types.ObjectId(businessId), _id: new Types.ObjectId(openingId) });
      await JobApplication.deleteMany({ businessId: new Types.ObjectId(businessId), jobOpeningId: new Types.ObjectId(openingId) });
      return { success: true };
    }
    memJobOpenings.delete(openingId);
    return { success: true };
  }

  static async listApplications(businessId: string, jobOpeningId?: string, status?: string) {
    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (jobOpeningId) query.jobOpeningId = new Types.ObjectId(jobOpeningId);
      if (status) query.status = status;

      const list = await JobApplication.find(query).populate('jobOpeningId', 'title departmentId').sort({ createdAt: -1 }).lean();
      return list;
    }

    let list = Array.from(memJobApplications.values()).filter((a) => a.businessId === businessId);
    if (jobOpeningId) list = list.filter((a) => String(a.jobOpeningId) === String(jobOpeningId));
    if (status) list = list.filter((a) => a.status === status);
    return list;
  }

  static async submitApplication(businessId: string, input: IJobApplicationInput) {
    if (isDbConnected()) {
      const application = await JobApplication.create({
        businessId: new Types.ObjectId(businessId),
        jobOpeningId: new Types.ObjectId(input.jobOpeningId),
        candidateName: input.candidateName.trim(),
        candidateEmail: input.candidateEmail.trim().toLowerCase(),
        candidatePhone: input.candidatePhone,
        resumeUrl: input.resumeUrl.trim(),
        coverNote: input.coverNote,
        experienceYears: input.experienceYears,
        status: 'APPLIED'
      });

      // Notification
      await this.createNotification(
        businessId,
        null,
        'New Job Application',
        `${input.candidateName} applied for open position.`,
        'RECRUITMENT',
        { applicationId: application._id }
      );

      return application;
    }

    const newId = `app_${Date.now()}`;
    const newApp = {
      _id: newId,
      businessId,
      ...input,
      status: 'APPLIED',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memJobApplications.set(newId, newApp);
    return newApp;
  }

  static async updateApplicationStatus(businessId: string, applicationId: string, status: string, actorUserId?: string) {
    if (isDbConnected()) {
      const app = await JobApplication.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(applicationId)
      });
      if (!app) throw new Error('Job application not found.');
      app.status = status as any;
      await app.save();
      await this.logActivity(businessId, actorUserId || null, 'APPLICATION_STATUS_UPDATED', `Candidate ${app.candidateName} status changed to ${status}`);
      return app;
    }

    const app = memJobApplications.get(applicationId);
    if (!app) throw new Error('Job application not found.');
    app.status = status;
    return app;
  }

  static async scheduleInterview(businessId: string, applicationId: string, interview: IInterviewScheduleInput, actorUserId?: string) {
    if (isDbConnected()) {
      const app = await JobApplication.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(applicationId)
      });
      if (!app) throw new Error('Job application not found.');

      app.status = 'INTERVIEW_SCHEDULED';
      app.interviewSchedule = {
        date: new Date(interview.scheduledDate),
        time: new Date(interview.scheduledDate).toLocaleTimeString(),
        interviewer: interview.interviewerName.trim(),
        mode: 'VIRTUAL',
        scheduledDate: new Date(interview.scheduledDate),
        interviewerName: interview.interviewerName.trim(),
        notes: interview.notes,
        meetingLink: interview.meetingLink
      };

      await app.save();

      // Notification
      await this.createNotification(
        businessId,
        null,
        'Interview Scheduled',
        `Interview scheduled for candidate ${app.candidateName} on ${new Date(interview.scheduledDate).toLocaleString()}`,
        'RECRUITMENT',
        { applicationId: app._id }
      );

      await this.logActivity(businessId, actorUserId || null, 'INTERVIEW_SCHEDULED', `Scheduled interview with ${app.candidateName}`);
      return app;
    }

    const app = memJobApplications.get(applicationId);
    if (!app) throw new Error('Job application not found.');
    app.status = 'INTERVIEW_SCHEDULED';
    app.interviewSchedule = interview;
    return app;
  }

  /**
   * ============================================================================
   * MODULE 6: PAYROLL MANAGEMENT
   * ============================================================================
   */

  static async getSalaryStructure(businessId: string, employeeId: string) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      let struct: any = await SalaryStructure.findOne({
        businessId: new Types.ObjectId(businessId),
        employeeId: new Types.ObjectId(employeeId)
      }).lean();

      if (!struct) {
        // Fallback to employee's basic salary
        const emp = await Employee.findById(employeeId);
        if (emp) {
          const created = await SalaryStructure.create({
            businessId: new Types.ObjectId(businessId),
            employeeId: emp._id,
            basicSalary: emp.salary.basicSalary,
            allowances: { hra: Math.round(emp.salary.basicSalary * 0.4), conveyance: 2000, medical: 1500, special: 2000, other: 0 },
            deductions: { pf: Math.round(emp.salary.basicSalary * 0.12), tax: Math.round(emp.salary.basicSalary * 0.08), insurance: 1000, other: 0 },
            currency: emp.salary.currency || 'INR'
          });
          struct = created.toObject();
        }
      }
      return struct;
    }

    return memSalaryStructures.get(`${businessId}_${employeeId}`) || null;
  }

  static async upsertSalaryStructure(businessId: string, input: ISalaryStructureInput, actorUserId?: string) {
    if (isDbConnected()) {
      const struct = await SalaryStructure.findOneAndUpdate(
        { businessId: new Types.ObjectId(businessId), employeeId: new Types.ObjectId(input.employeeId) },
        {
          basicSalary: input.basicSalary,
          allowances: input.allowances || {},
          deductions: input.deductions || {},
          currency: input.currency || 'INR'
        },
        { upsert: true, new: true }
      );

      // Sync employee basic salary
      await Employee.findByIdAndUpdate(input.employeeId, {
        'salary.basicSalary': input.basicSalary,
        'salary.currency': input.currency || 'INR'
      });

      await this.logActivity(businessId, actorUserId || null, 'SALARY_STRUCTURE_UPDATED', `Updated salary structure for employee ${input.employeeId}`);
      return struct;
    }

    const key = `${businessId}_${input.employeeId}`;
    const newStruct = {
      _id: `ss_${Date.now()}`,
      businessId,
      ...input,
      currency: input.currency || 'INR',
      updatedAt: new Date()
    };
    memSalaryStructures.set(key, newStruct);
    return newStruct;
  }

  static async generateMonthlyPayroll(businessId: string, input: IPayrollGenerateInput, actorUserId?: string) {
    await seedDemoHRIfEmpty(businessId);
    const { month, year, notes } = input;
    const periodStr = `${year}-${String(month).padStart(2, '0')}`;

    if (isDbConnected()) {
      // 1. Duplicate check: prevent duplicate payroll generation for same period
      const existing = await Payroll.findOne({
        businessId: new Types.ObjectId(businessId),
        payrollPeriod: periodStr
      });

      if (existing) {
        throw new Error(`Payroll for period '${periodStr}' has already been generated.`);
      }

      // 2. Fetch all active employees
      const employees = await Employee.find({
        businessId: new Types.ObjectId(businessId),
        status: 'ACTIVE'
      });

      if (employees.length === 0) {
        throw new Error('No active employees found to generate payroll for.');
      }

      // 3. Create initial payroll container
      const payroll = new Payroll({
        businessId: new Types.ObjectId(businessId),
        month,
        year,
        payrollPeriod: periodStr,
        totalEmployees: employees.length,
        totalGrossSalary: 0,
        totalDeductions: 0,
        totalNetSalary: 0,
        currency: 'INR',
        status: 'DRAFT',
        generatedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined,
        notes
      });
      await payroll.save();

      let aggregateGross = 0;
      let aggregateDeductions = 0;
      let aggregateNet = 0;
      const payslips: any[] = [];

      const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      const totalWorkingDays = 22; // Standard monthly working days

      // 4. Generate itemized payslip for each employee
      for (const emp of employees) {
        let structure: any = await SalaryStructure.findOne({
          businessId: new Types.ObjectId(businessId),
          employeeId: emp._id
        });

        if (!structure) {
          structure = {
            basicSalary: emp.salary.basicSalary,
            allowances: { hra: Math.round(emp.salary.basicSalary * 0.4), conveyance: 2000, medical: 1500, special: 2000, other: 0 },
            deductions: { pf: Math.round(emp.salary.basicSalary * 0.12), tax: Math.round(emp.salary.basicSalary * 0.08), insurance: 1000, other: 0 }
          };
        }

        // Attendance & leave calculations for this month
        const presentCount = await Attendance.countDocuments({
          businessId: new Types.ObjectId(businessId),
          employeeId: emp._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $in: ['PRESENT', 'LATE'] }
        });

        const halfDayCount = await Attendance.countDocuments({
          businessId: new Types.ObjectId(businessId),
          employeeId: emp._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'HALF_DAY'
        });

        const approvedLeaves = await LeaveRequest.find({
          businessId: new Types.ObjectId(businessId),
          employeeId: emp._id,
          status: 'APPROVED',
          startDate: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const paidLeavesCount = approvedLeaves
          .filter((l) => l.leaveType !== 'UNPAID_LEAVE')
          .reduce((sum, l) => sum + (l.daysCount || 0), 0);

        const unpaidLeavesCount = approvedLeaves
          .filter((l) => l.leaveType === 'UNPAID_LEAVE')
          .reduce((sum, l) => sum + (l.daysCount || 0), 0);

        // Transparent Unpaid Leave Deduction Formula: (basicSalary / 22) * unpaidLeaves
        const unpaidDeduction = Math.round((structure.basicSalary / totalWorkingDays) * unpaidLeavesCount);

        const allowances = {
          hra: structure.allowances?.hra || 0,
          conveyance: structure.allowances?.conveyance || 0,
          medical: structure.allowances?.medical || 0,
          special: structure.allowances?.special || 0,
          other: structure.allowances?.other || 0
        };

        const totalAllowances = allowances.hra + allowances.conveyance + allowances.medical + allowances.special + allowances.other;
        const grossSalary = structure.basicSalary + totalAllowances;

        const deductions = {
          pf: structure.deductions?.pf || 0,
          tax: structure.deductions?.tax || 0,
          insurance: structure.deductions?.insurance || 0,
          unpaidLeaveDeduction: unpaidDeduction,
          other: structure.deductions?.other || 0
        };

        const totalEmpDeductions = deductions.pf + deductions.tax + deductions.insurance + deductions.unpaidLeaveDeduction + deductions.other;
        const netSalary = Math.max(0, grossSalary - totalEmpDeductions);

        const payslip = await Payslip.create({
          businessId: new Types.ObjectId(businessId),
          payrollId: payroll._id,
          employeeId: emp._id,
          payrollPeriod: periodStr,
          employeeName: emp.fullName,
          designation: emp.designation,
          department: emp.departmentName || 'General',
          basicSalary: structure.basicSalary,
          allowances,
          deductions,
          grossSalary,
          netSalary,
          attendanceSummary: {
            totalWorkingDays,
            presentDays: presentCount + halfDayCount * 0.5,
            leavesTaken: paidLeavesCount,
            unpaidLeaves: unpaidLeavesCount,
            workingHours: (presentCount + halfDayCount * 0.5) * 8
          },
          currency: emp.salary.currency || 'INR',
          status: 'GENERATED'
        });

        payslips.push(payslip);
        aggregateGross += grossSalary;
        aggregateDeductions += totalEmpDeductions;
        aggregateNet += netSalary;
      }

      // 5. Update aggregate totals
      payroll.totalGrossSalary = aggregateGross;
      payroll.totalDeductions = aggregateDeductions;
      payroll.totalNetSalary = aggregateNet;
      await payroll.save();

      // 6. Notification
      await this.createNotification(
        businessId,
        null,
        'Payroll Generated',
        `Monthly payroll for ${periodStr} has been successfully generated (${employees.length} employees, Net: ${aggregateNet}).`,
        'PAYROLL',
        { payrollId: payroll._id }
      );

      await this.logActivity(businessId, actorUserId || null, 'PAYROLL_GENERATED', `Generated payroll for ${periodStr}`, {
        payrollId: payroll._id
      });

      return { payroll, payslips };
    }

    // In-memory fallback
    if (memPayrolls.has(`${businessId}_${periodStr}`)) {
      throw new Error(`Payroll for period '${periodStr}' has already been generated.`);
    }

    const payrollId = `pay_${Date.now()}`;
    const activeEmps = Array.from(memEmployees.values()).filter((e) => e.businessId === businessId && e.status === 'ACTIVE');

    let gross = 0;
    let net = 0;
    let deductions = 0;
    const payslips: any[] = [];

    activeEmps.forEach((emp) => {
      const basic = emp.salary?.basicSalary || 50000;
      const g = basic + 15000;
      const d = 8000;
      const n = g - d;
      gross += g;
      deductions += d;
      net += n;

      const pId = `ps_${emp._id}_${periodStr}`;
      const ps = {
        _id: pId,
        businessId,
        payrollId,
        employeeId: emp._id,
        payrollPeriod: periodStr,
        employeeName: emp.fullName,
        designation: emp.designation,
        department: emp.departmentName || 'General',
        basicSalary: basic,
        allowances: { hra: 8000, conveyance: 2000, medical: 2000, special: 3000, other: 0 },
        deductions: { pf: 3000, tax: 4000, insurance: 1000, unpaidLeaveDeduction: 0, other: 0 },
        grossSalary: g,
        netSalary: n,
        attendanceSummary: { totalWorkingDays: 22, presentDays: 22, leavesTaken: 0, unpaidLeaves: 0, workingHours: 176 },
        currency: 'INR',
        status: 'GENERATED',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memPayslips.set(pId, ps);
      payslips.push(ps);
    });

    const payrollObj = {
      _id: payrollId,
      businessId,
      month,
      year,
      payrollPeriod: periodStr,
      totalEmployees: activeEmps.length,
      totalGrossSalary: gross,
      totalDeductions: deductions,
      totalNetSalary: net,
      currency: 'INR',
      status: 'DRAFT',
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memPayrolls.set(`${businessId}_${periodStr}`, payrollObj);

    return { payroll: payrollObj, payslips };
  }

  static async listPayrolls(businessId: string) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      const list = await Payroll.find({ businessId: new Types.ObjectId(businessId) }).sort({ year: -1, month: -1 }).lean();
      return list;
    }

    return Array.from(memPayrolls.values()).filter((p) => p.businessId === businessId);
  }

  static async getPayrollDetails(businessId: string, payrollId: string) {
    if (isDbConnected()) {
      const payroll = await Payroll.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(payrollId)
      }).lean();

      if (!payroll) throw new Error('Payroll record not found.');

      const payslips = await Payslip.find({
        businessId: new Types.ObjectId(businessId),
        payrollId: payroll._id
      }).lean();

      return { payroll, payslips };
    }

    const payroll = Array.from(memPayrolls.values()).find((p) => p.businessId === businessId && p._id === payrollId);
    if (!payroll) throw new Error('Payroll record not found.');
    const payslips = Array.from(memPayslips.values()).filter((ps) => ps.payrollId === payrollId);
    return { payroll, payslips };
  }

  static async updatePayrollStatus(businessId: string, payrollId: string, status: PayrollStatusType, paymentDate?: string, actorUserId?: string) {
    if (isDbConnected()) {
      const payroll = await Payroll.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(payrollId)
      });
      if (!payroll) throw new Error('Payroll record not found.');

      payroll.status = status;
      if (status === 'PAID') {
        payroll.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
        await Payslip.updateMany({ payrollId: payroll._id }, { status: 'PAID', paidAt: payroll.paymentDate });
      }

      await payroll.save();
      await this.logActivity(businessId, actorUserId || null, 'PAYROLL_STATUS_UPDATED', `Payroll for ${payroll.payrollPeriod} updated to ${status}`);
      return payroll;
    }

    const payroll = Array.from(memPayrolls.values()).find((p) => p.businessId === businessId && p._id === payrollId);
    if (!payroll) throw new Error('Payroll record not found.');
    payroll.status = status;
    return payroll;
  }

  static async getEmployeePayslips(businessId: string, actorUserId: string) {
    await seedDemoHRIfEmpty(businessId);
    if (isDbConnected()) {
      let emp: any = await Employee.findOne({
        businessId: new Types.ObjectId(businessId),
        userId: new Types.ObjectId(actorUserId)
      });
      if (!emp && Types.ObjectId.isValid(actorUserId)) {
        emp = await Employee.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: new Types.ObjectId(actorUserId)
        });
      }
      if (!emp) return [];

      const payslips = await Payslip.find({
        businessId: new Types.ObjectId(businessId),
        employeeId: emp._id
      })
        .sort({ payrollPeriod: -1 })
        .lean();

      return payslips;
    }

    const emp = Array.from(memEmployees.values()).find(
      (e) => e.businessId === businessId && (String(e.userId) === String(actorUserId) || String(e._id) === String(actorUserId))
    );
    if (!emp) return [];

    return Array.from(memPayslips.values()).filter(
      (ps) => ps.businessId === businessId && String(ps.employeeId) === String(emp._id)
    );
  }

  static async getPayslipById(businessId: string, payslipId: string) {
    if (isDbConnected()) {
      const payslip = await Payslip.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(payslipId)
      }).populate('employeeId').lean();

      if (!payslip) throw new Error('Payslip not found.');
      return payslip;
    }

    const payslip = memPayslips.get(payslipId);
    if (!payslip) throw new Error('Payslip not found.');
    return payslip;
  }

  /**
   * ============================================================================
   * MODULE 7: HR REPORTS & EXPORT
   * ============================================================================
   */

  static async getHRReports(businessId: string) {
    await seedDemoHRIfEmpty(businessId);

    // 1. Total Employee Report
    const { employees } = await this.listEmployees(businessId, { limit: 1000 });
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e: any) => e.status === 'ACTIVE').length;
    const probationEmployees = employees.filter((e: any) => e.status === 'PROBATION' || e.status === 'INACTIVE').length;
    const employmentTypeBreakdown: Record<string, number> = {};
    employees.forEach((e: any) => {
      employmentTypeBreakdown[e.employmentType] = (employmentTypeBreakdown[e.employmentType] || 0) + 1;
    });

    // 2. Department-wise Report
    const departments = await this.listDepartments(businessId);

    // 3. Daily Attendance Report
    const today = this.getTodayDateOnly();
    const todayRecords = await this.listAttendance(businessId, {
      startDate: today.toISOString(),
      endDate: new Date(today.getTime() + 86400000).toISOString()
    });
    const presentToday = todayRecords.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const lateToday = todayRecords.filter((r: any) => r.status === 'LATE').length;
    const onLeaveToday = todayRecords.filter((r: any) => r.status === 'ON_LEAVE').length;

    // 4. Monthly Attendance Report
    const now = new Date();
    const calendarData = await this.getAttendanceCalendar(businessId, employees[0]?._id || '', now.getMonth() + 1, now.getFullYear());

    // 5. Leave Statistics Report
    const leaves = await this.listLeaveRequests(businessId);
    const leaveStats = {
      totalRequests: leaves.length,
      approved: leaves.filter((l: any) => l.status === 'APPROVED').length,
      pending: leaves.filter((l: any) => l.status === 'PENDING').length,
      rejected: leaves.filter((l: any) => l.status === 'REJECTED').length,
      byType: {
        casual: leaves.filter((l: any) => l.leaveType === 'CASUAL_LEAVE').length,
        sick: leaves.filter((l: any) => l.leaveType === 'SICK_LEAVE').length,
        earned: leaves.filter((l: any) => l.leaveType === 'EARNED_LEAVE').length,
        unpaid: leaves.filter((l: any) => l.leaveType === 'UNPAID_LEAVE').length
      }
    };

    // 6. Payroll Summary Report
    const payrolls = await this.listPayrolls(businessId);
    const totalPayrollDisbursed = payrolls.reduce((sum: number, p: any) => sum + (p.totalNetSalary || 0), 0);
    const totalPayrollGross = payrolls.reduce((sum: number, p: any) => sum + (p.totalGrossSalary || 0), 0);

    // 7. Recruitment Statistics Report
    const openings = await this.listJobOpenings(businessId);
    const applications = await this.listApplications(businessId);
    const recruitmentStats = {
      openPositions: openings.filter((o: any) => o.status === 'ACTIVE').length,
      totalApplications: applications.length,
      shortlisted: applications.filter((a: any) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW_SCHEDULED').length,
      interviewsHeld: applications.filter((a: any) => a.status === 'INTERVIEW_SCHEDULED' || a.status === 'SELECTED').length,
      selected: applications.filter((a: any) => a.status === 'SELECTED').length
    };

    return {
      totalEmployeeReport: {
        totalEmployees,
        activeEmployees,
        probationEmployees,
        employmentTypeBreakdown
      },
      departmentWiseReport: departments,
      dailyAttendanceReport: {
        totalExpected: totalEmployees,
        present: presentToday,
        late: lateToday,
        onLeave: onLeaveToday,
        attendanceRate: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0
      },
      monthlyAttendanceReport: calendarData.summary,
      leaveStatisticsReport: leaveStats,
      payrollSummaryReport: {
        totalCycles: payrolls.length,
        totalPayrollGross,
        totalPayrollDisbursed,
        recentPayrolls: payrolls.slice(0, 5)
      },
      recruitmentStatisticsReport: recruitmentStats
    };
  }

  static async exportReportCSV(businessId: string, reportType: string): Promise<string> {
    const data = await this.getHRReports(businessId);

    switch (reportType.toUpperCase()) {
      case 'DEPARTMENT': {
        const header = ['Department Name', 'Code', 'Employee Count', 'Budget', 'Active'];
        const rows = data.departmentWiseReport.map((d: any) => [
          `"${d.name}"`,
          `"${d.code}"`,
          `"${d.employeeCount || 0}"`,
          `"${d.budget || 0}"`,
          `"${d.isActive ? 'Yes' : 'No'}"`
        ]);
        return [header.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
      }

      case 'PAYROLL': {
        const header = ['Payroll Period', 'Total Employees', 'Gross Salary', 'Total Deductions', 'Net Salary', 'Status'];
        const rows = (data.payrollSummaryReport.recentPayrolls || []).map((p: any) => [
          `"${p.payrollPeriod}"`,
          `"${p.totalEmployees}"`,
          `"${p.totalGrossSalary}"`,
          `"${p.totalDeductions}"`,
          `"${p.totalNetSalary}"`,
          `"${p.status}"`
        ]);
        return [header.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
      }

      case 'LEAVE': {
        const header = ['Total Requests', 'Approved', 'Pending', 'Rejected', 'Casual Leaves', 'Sick Leaves', 'Earned Leaves', 'Unpaid Leaves'];
        const s = data.leaveStatisticsReport;
        const row = [s.totalRequests, s.approved, s.pending, s.rejected, s.byType.casual, s.byType.sick, s.byType.earned, s.byType.unpaid];
        return [header.join(','), row.join(',')].join('\n');
      }

      case 'EMPLOYEE':
      default:
        return this.exportEmployees(businessId);
    }
  }

  /**
   * ============================================================================
   * MODULE 8: NOTIFICATION SYSTEM
   * ============================================================================
   */

  static async createNotification(
    businessId: string,
    recipientUserId: string | null,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: any
  ) {
    if (isDbConnected()) {
      const notif = await Notification.create({
        businessId: new Types.ObjectId(businessId),
        recipientUserId: recipientUserId && Types.ObjectId.isValid(recipientUserId) ? new Types.ObjectId(recipientUserId) : null,
        title,
        message,
        type,
        read: false,
        metadata
      });
      return notif;
    }

    const nId = `notif_${Date.now()}_${Math.random()}`;
    const notifObj = {
      _id: nId,
      businessId,
      recipientUserId,
      title,
      message,
      type,
      read: false,
      metadata,
      createdAt: new Date()
    };
    memNotifications.set(nId, notifObj);
    return notifObj;
  }

  static async getUserNotifications(businessId: string, userId: string, unreadOnly: boolean = false) {
    if (isDbConnected()) {
      const query: any = {
        businessId: new Types.ObjectId(businessId),
        $or: [
          { recipientUserId: null }, // broadcast to business admins/managers
          ...(Types.ObjectId.isValid(userId) ? [{ recipientUserId: new Types.ObjectId(userId) }] : [])
        ]
      };
      if (unreadOnly) query.read = false;

      const list = await Notification.find(query).sort({ createdAt: -1 }).limit(50).lean();
      return list;
    }

    let list = Array.from(memNotifications.values()).filter(
      (n) => n.businessId === businessId && (!n.recipientUserId || String(n.recipientUserId) === String(userId))
    );
    if (unreadOnly) list = list.filter((n) => !n.read);
    return list;
  }

  static async markNotificationAsRead(businessId: string, notificationId: string, userId: string) {
    if (isDbConnected()) {
      await Notification.updateOne(
        { businessId: new Types.ObjectId(businessId), _id: new Types.ObjectId(notificationId) },
        { read: true }
      );
      return { success: true };
    }

    const n = memNotifications.get(notificationId);
    if (n) n.read = true;
    return { success: true };
  }

  static async markAllNotificationsAsRead(businessId: string, userId: string) {
    if (isDbConnected()) {
      await Notification.updateMany(
        {
          businessId: new Types.ObjectId(businessId),
          $or: [{ recipientUserId: null }, { recipientUserId: new Types.ObjectId(userId) }]
        },
        { read: true }
      );
      return { success: true };
    }

    Array.from(memNotifications.values()).forEach((n) => {
      if (n.businessId === businessId && (!n.recipientUserId || String(n.recipientUserId) === String(userId))) {
        n.read = true;
      }
    });
    return { success: true };
  }
}

export default HRService;
