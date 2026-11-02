import { z } from 'zod';

export const employeeInputSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  phone: z.string().trim().min(5, 'Phone number must be at least 5 digits').optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  address: z
    .object({
      street: z.string().optional().default(''),
      city: z.string().optional().default(''),
      state: z.string().optional().default(''),
      postalCode: z.string().optional().default(''),
      country: z.string().optional().default('India')
    })
    .optional(),
  departmentId: z.string().optional().or(z.literal('')),
  designation: z.string().trim().min(2, 'Designation is required'),
  joiningDate: z.string().min(4, 'Valid joining date is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).default('FULL_TIME'),
  salary: z.object({
    basicSalary: z.number().nonnegative('Basic salary must be 0 or greater'),
    currency: z.string().default('INR')
  }),
  emergencyContact: z
    .object({
      name: z.string().trim().default(''),
      relationship: z.string().trim().default(''),
      phone: z.string().trim().default('')
    })
    .optional(),
  profilePhoto: z.string().nullable().optional(),
  initialPassword: z.string().min(6, 'Initial password must be at least 6 characters').optional()
});

export const employeeUpdateSchema = employeeInputSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED']).optional()
});

export const employeeDocumentUploadSchema = z.object({
  name: z.string().trim().min(2, 'Document title is required'),
  url: z.string().trim().min(2, 'Valid document URL is required'),
  fileType: z.string().trim().min(2, 'File type is required')
});

export const departmentInputSchema = z.object({
  name: z.string().trim().min(2, 'Department name must be at least 2 characters'),
  code: z.string().trim().min(2, 'Department code is required (e.g., HR, IT)'),
  description: z.string().trim().optional().default(''),
  managerId: z.string().optional().or(z.literal('')),
  budget: z.number().nonnegative('Budget must be positive').optional().default(0)
});

export const departmentUpdateSchema = departmentInputSchema.partial().extend({
  isActive: z.boolean().optional()
});

export const assignManagerSchema = z.object({
  managerId: z.string().min(1, 'Manager ID is required')
});

export const assignEmployeesSchema = z.object({
  employeeIds: z.array(z.string()).min(1, 'At least one employee must be selected')
});

export const checkInSchema = z.object({
  notes: z.string().optional(),
  ipAddress: z.string().optional()
});

export const checkOutSchema = z.object({
  notes: z.string().optional()
});

export const leaveRequestSchema = z.object({
  leaveType: z.enum(['CASUAL_LEAVE', 'SICK_LEAVE', 'EARNED_LEAVE', 'UNPAID_LEAVE']),
  startDate: z.string().min(4, 'Valid start date is required'),
  endDate: z.string().min(4, 'Valid end date is required'),
  reason: z.string().trim().min(3, 'Leave reason must be at least 3 characters')
});

export const leaveActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().trim().optional()
});

export const leavePolicySchema = z.object({
  casualLeaveQuota: z.number().min(0).max(60).optional(),
  sickLeaveQuota: z.number().min(0).max(60).optional(),
  earnedLeaveQuota: z.number().min(0).max(60).optional(),
  unpaidLeaveAllowed: z.boolean().optional(),
  carryForwardLimit: z.number().min(0).max(60).optional()
});

export const jobOpeningSchema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  title: z.string().trim().min(2, 'Job title is required'),
  description: z.string().trim().min(10, 'Job description must be at least 10 characters'),
  qualifications: z.array(z.string()).min(1, 'At least one qualification is required'),
  experienceYears: z.number().min(0, 'Experience years must be positive').default(0),
  salaryRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().default('INR')
    })
    .optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).default('FULL_TIME'),
  positionsCount: z.number().int().positive('Positions count must be at least 1').default(1),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'ON_HOLD']).optional().default('ACTIVE')
});

export const jobApplicationSchema = z.object({
  jobOpeningId: z.string().min(1, 'Job opening ID is required'),
  candidateName: z.string().trim().min(2, 'Candidate name is required'),
  candidateEmail: z.string().trim().toLowerCase().email('Valid candidate email is required'),
  candidatePhone: z.string().trim().optional().default(''),
  resumeUrl: z.string().trim().min(2, 'Resume URL or document path is required'),
  coverNote: z.string().trim().optional().default(''),
  experienceYears: z.number().min(0).optional().default(0)
});

export const jobApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'])
});

export const interviewScheduleSchema = z.object({
  scheduledDate: z.string().min(4, 'Valid interview date & time is required'),
  interviewerName: z.string().trim().min(2, 'Interviewer name is required'),
  notes: z.string().trim().optional().default(''),
  meetingLink: z.string().trim().optional().default('')
});

export const salaryStructureSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  basicSalary: z.number().nonnegative('Basic salary must be 0 or greater'),
  allowances: z
    .object({
      hra: z.number().min(0).default(0),
      conveyance: z.number().min(0).default(0),
      medical: z.number().min(0).default(0),
      special: z.number().min(0).default(0),
      other: z.number().min(0).default(0)
    })
    .optional(),
  deductions: z
    .object({
      pf: z.number().min(0).default(0),
      tax: z.number().min(0).default(0),
      insurance: z.number().min(0).default(0),
      other: z.number().min(0).default(0)
    })
    .optional(),
  currency: z.string().default('INR')
});

export const payrollGenerateSchema = z.object({
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2020).max(2050, 'Year must be valid'),
  notes: z.string().trim().optional()
});

export const payrollStatusSchema = z.object({
  status: z.enum(['DRAFT', 'APPROVED', 'PAID']),
  paymentDate: z.string().optional()
});

