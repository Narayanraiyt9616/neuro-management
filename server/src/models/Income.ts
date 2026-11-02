import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type IncomePaymentMethod =
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CASH'
  | 'CHEQUE'
  | 'OTHER';

export type IncomeStatus = 'RECORDED' | 'VOID';

export interface IIncomeDocument extends Document {
  businessId: Types.ObjectId;
  incomeNumber: string;
  title: string;
  category: string;
  source: string;
  amount: number;
  taxDeducted: number;
  netAmount: number;
  date: Date;
  paymentMethod: IncomePaymentMethod;
  referenceNumber?: string;
  customerId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  notes?: string;
  recordedBy?: Types.ObjectId;
  status: IncomeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncomeDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    incomeNumber: {
      type: String,
      required: [true, 'Income number is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Income title is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Income category is required'],
      default: 'Product Sales',
      trim: true,
      index: true
    },
    source: {
      type: String,
      required: [true, 'Income source is required'],
      default: 'Direct Client',
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Gross income amount is required'],
      min: [0, 'Amount must be non-negative']
    },
    taxDeducted: {
      type: Number,
      default: 0,
      min: [0, 'Tax deducted must be non-negative']
    },
    netAmount: {
      type: Number,
      required: true,
      min: [0, 'Net amount must be non-negative']
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'CHEQUE', 'OTHER'],
      default: 'BANK_TRANSFER'
    },
    referenceNumber: {
      type: String,
      trim: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      default: null
    },
    notes: {
      type: String,
      trim: true
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['RECORDED', 'VOID'],
      default: 'RECORDED',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
IncomeSchema.index({ businessId: 1, incomeNumber: 1 }, { unique: true });
IncomeSchema.index({ businessId: 1, date: -1 });
IncomeSchema.index({ businessId: 1, category: 1 });

export const Income: Model<IIncomeDocument> =
  mongoose.models.Income || mongoose.model<IIncomeDocument>('Income', IncomeSchema);

export default Income;

