import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PaymentMethodType =
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CASH'
  | 'CHEQUE'
  | 'OTHER';

export type PaymentTransactionStatus =
  | 'COMPLETED'
  | 'PENDING_VERIFICATION'
  | 'FAILED'
  | 'REFUNDED';

export interface IPaymentDocument extends Document {
  businessId: Types.ObjectId;
  paymentNumber: string;
  invoiceId?: Types.ObjectId;
  customerId?: Types.ObjectId;
  customerName?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethodType;
  referenceNumber: string;
  status: PaymentTransactionStatus;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  notes?: string;
  receivedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    paymentNumber: {
      type: String,
      required: [true, 'Payment number is required'],
      trim: true
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      default: null,
      index: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true
    },
    customerName: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than 0']
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'CHEQUE', 'OTHER'],
      required: true,
      default: 'BANK_TRANSFER'
    },
    referenceNumber: {
      type: String,
      required: [true, 'Transaction reference / UTR number is required for verification'],
      trim: true
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING_VERIFICATION', 'FAILED', 'REFUNDED'],
      default: 'COMPLETED',
      index: true
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    verifiedAt: {
      type: Date,
      default: Date.now
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      trim: true
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
PaymentSchema.index({ businessId: 1, paymentNumber: 1 }, { unique: true });
PaymentSchema.index({ businessId: 1, paymentDate: -1 });

export const Payment: Model<IPaymentDocument> =
  mongoose.models.Payment || mongoose.model<IPaymentDocument>('Payment', PaymentSchema);

export default Payment;

