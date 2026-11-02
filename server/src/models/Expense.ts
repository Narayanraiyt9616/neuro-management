import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ExpenseApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IExpenseDocument extends Document {
  businessId: Types.ObjectId;
  expenseNumber: string;
  title: string;
  categoryId?: Types.ObjectId;
  category: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  date: Date;
  vendor?: string;
  vendorGstin?: string;
  paymentMethod?: string;
  reference?: string;
  receiptUrl?: string;
  description?: string;
  approvalStatus: ExpenseApprovalStatus;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  isPayroll: boolean;
  payrollId?: Types.ObjectId;
  isInventoryPurchase: boolean;
  purchaseOrderId?: Types.ObjectId;
  recordedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    expenseNumber: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpenseCategory',
      default: null
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      trim: true,
      default: 'Operations',
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      default: function (this: IExpenseDocument) {
        return (this.amount || 0) + (this.taxAmount || 0);
      },
      min: 0
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    vendor: {
      type: String,
      trim: true
    },
    vendorGstin: {
      type: String,
      trim: true
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'BANK_TRANSFER'
    },
    reference: {
      type: String,
      trim: true
    },
    receiptUrl: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    isPayroll: {
      type: Boolean,
      default: false,
      index: true
    },
    payrollId: {
      type: Schema.Types.ObjectId,
      ref: 'Payroll',
      default: null
    },
    isInventoryPurchase: {
      type: Boolean,
      default: false,
      index: true
    },
    purchaseOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      default: null
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

ExpenseSchema.index({ businessId: 1, date: -1 });
ExpenseSchema.index({ businessId: 1, category: 1 });
ExpenseSchema.index({ businessId: 1, approvalStatus: 1 });

export const Expense: Model<IExpenseDocument> =
  mongoose.models.Expense || mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);

export default Expense;
