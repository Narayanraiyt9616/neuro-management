import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type FinancialTransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'INVOICE_ISSUED'
  | 'PAYMENT_RECEIVED'
  | 'REFUND_ISSUED'
  | 'PAYROLL_DISBURSEMENT'
  | 'PURCHASE_PAYMENT';

export type FinancialReferenceType =
  | 'INVOICE'
  | 'PAYMENT'
  | 'EXPENSE'
  | 'INCOME'
  | 'PAYROLL'
  | 'PURCHASE_ORDER'
  | 'REFUND';

export interface IFinancialTransactionDocument extends Document {
  businessId: Types.ObjectId;
  transactionNumber: string;
  date: Date;
  type: FinancialTransactionType;
  category: string;
  amount: number;
  debit: number;
  credit: number;
  balanceAfter: number;
  referenceType: FinancialReferenceType;
  referenceId: string;
  paymentMethod?: string;
  description: string;
  performedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialTransactionSchema = new Schema<IFinancialTransactionDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    transactionNumber: {
      type: String,
      required: [true, 'Transaction number is required'],
      trim: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    type: {
      type: String,
      enum: [
        'INCOME',
        'EXPENSE',
        'INVOICE_ISSUED',
        'PAYMENT_RECEIVED',
        'REFUND_ISSUED',
        'PAYROLL_DISBURSEMENT',
        'PURCHASE_PAYMENT'
      ],
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    debit: {
      type: Number,
      default: 0
    },
    credit: {
      type: Number,
      default: 0
    },
    balanceAfter: {
      type: Number,
      default: 0
    },
    referenceType: {
      type: String,
      enum: [
        'INVOICE',
        'PAYMENT',
        'EXPENSE',
        'INCOME',
        'PAYROLL',
        'PURCHASE_ORDER',
        'REFUND'
      ],
      required: true
    },
    referenceId: {
      type: String,
      required: true,
      trim: true
    },
    paymentMethod: {
      type: String,
      default: 'BANK_TRANSFER'
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

FinancialTransactionSchema.index({ businessId: 1, transactionNumber: 1 }, { unique: true });
FinancialTransactionSchema.index({ businessId: 1, date: -1 });
FinancialTransactionSchema.index({ businessId: 1, type: 1 });

export const FinancialTransaction: Model<IFinancialTransactionDocument> =
  mongoose.models.FinancialTransaction ||
  mongoose.model<IFinancialTransactionDocument>('FinancialTransaction', FinancialTransactionSchema);

export default FinancialTransaction;

