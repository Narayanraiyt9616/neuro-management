import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPayslipDocument extends Document {
  businessId: Types.ObjectId;
  payrollId: Types.ObjectId;
  employeeId: Types.ObjectId;
  userId?: Types.ObjectId;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  month: number;
  year: number;
  payrollPeriod: string;
  basicSalary: number;
  allowances: Array<{ title: string; amount: number }>;
  bonuses: number;
  grossSalary: number;
  deductions: Array<{ title: string; amount: number }>;
  totalDeductions: number;
  netSalary: number;
  currency: string;
  attendanceSummary: {
    workingDays: number;
    daysPresent: number;
    halfDays: number;
    leavesTaken: number;
    unpaidLeaves: number;
    calculatedHours: number;
  };
  paymentStatus: 'PENDING' | 'PAID';
  paidAt?: Date | null;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayslipSchema = new Schema<IPayslipDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    payrollId: {
      type: Schema.Types.ObjectId,
      ref: 'Payroll',
      required: true,
      index: true
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    employeeName: {
      type: String,
      required: true
    },
    employeeCode: {
      type: String,
      required: true
    },
    designation: {
      type: String,
      default: 'Team Member'
    },
    department: {
      type: String,
      default: 'General'
    },
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    payrollPeriod: {
      type: String,
      required: true,
      index: true
    },
    basicSalary: {
      type: Number,
      required: true
    },
    allowances: [
      {
        title: String,
        amount: Number
      }
    ],
    bonuses: {
      type: Number,
      default: 0
    },
    grossSalary: {
      type: Number,
      required: true
    },
    deductions: [
      {
        title: String,
        amount: Number
      }
    ],
    totalDeductions: {
      type: Number,
      default: 0
    },
    netSalary: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    attendanceSummary: {
      workingDays: { type: Number, default: 22 },
      daysPresent: { type: Number, default: 22 },
      halfDays: { type: Number, default: 0 },
      leavesTaken: { type: Number, default: 0 },
      unpaidLeaves: { type: Number, default: 0 },
      calculatedHours: { type: Number, default: 176 }
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
      index: true
    },
    paidAt: {
      type: Date,
      default: null
    },
    paymentMethod: {
      type: String,
      default: 'Direct Deposit'
    }
  },
  {
    timestamps: true
  }
);

PayslipSchema.index({ businessId: 1, employeeId: 1, payrollPeriod: 1 }, { unique: true });
PayslipSchema.index({ businessId: 1, userId: 1 });

export const Payslip: Model<IPayslipDocument> =
  mongoose.models.Payslip || mongoose.model<IPayslipDocument>('Payslip', PayslipSchema);

export default Payslip;

