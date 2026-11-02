import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAllowanceItem {
  title: string;
  amount: number;
}

export interface IDeductionItem {
  title: string;
  amount: number;
}

export interface ISalaryStructureDocument extends Document {
  businessId: Types.ObjectId;
  employeeId: Types.ObjectId;
  basicSalary: number;
  allowances: IAllowanceItem[];
  deductions: IDeductionItem[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const AllowanceItemSchema = new Schema<IAllowanceItem>(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const DeductionItemSchema = new Schema<IDeductionItem>(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const SalaryStructureSchema = new Schema<ISalaryStructureDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
      unique: true
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: 0,
      default: 4500
    },
    allowances: [AllowanceItemSchema],
    deductions: [DeductionItemSchema],
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    }
  },
  {
    timestamps: true
  }
);

SalaryStructureSchema.index({ businessId: 1, employeeId: 1 }, { unique: true });

export const SalaryStructure: Model<ISalaryStructureDocument> =
  mongoose.models.SalaryStructure ||
  mongoose.model<ISalaryStructureDocument>('SalaryStructure', SalaryStructureSchema);

export default SalaryStructure;

