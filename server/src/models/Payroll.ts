import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PayrollStatus = 'DRAFT' | 'APPROVED' | 'PAID';

export interface IPayrollDocument extends Document {
  businessId: Types.ObjectId;
  month: number; // 1 - 12
  year: number; // e.g. 2026
  payrollPeriod: string; // e.g. "2026-10"
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  currency: string;
  status: PayrollStatus;
  paymentDate?: Date;
  generatedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema = new Schema<IPayrollDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true,
      min: 2020
    },
    payrollPeriod: {
      type: String,
      required: true,
      index: true
    },
    totalEmployees: {
      type: Number,
      default: 0
    },
    totalGrossSalary: {
      type: Number,
      default: 0
    },
    totalDeductions: {
      type: Number,
      default: 0
    },
    totalNetSalary: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'PAID'],
      default: 'DRAFT',
      index: true
    },
    paymentDate: {
      type: Date,
      default: null
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate monthly payroll generation for the same business & period
PayrollSchema.index({ businessId: 1, payrollPeriod: 1 }, { unique: true });

export const Payroll: Model<IPayrollDocument> =
  mongoose.models.Payroll || mongoose.model<IPayrollDocument>('Payroll', PayrollSchema);

export default Payroll;

