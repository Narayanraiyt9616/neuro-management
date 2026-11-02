import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type RefundStatus = 'PROCESSED' | 'PENDING' | 'REJECTED';

export interface IRefundDocument extends Document {
  businessId: Types.ObjectId;
  refundNumber: string;
  paymentId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  customerId?: Types.ObjectId;
  customerName?: string;
  amount: number;
  refundDate: Date;
  reason: string;
  refundMethod: string;
  referenceNumber: string;
  status: RefundStatus;
  approvedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefundDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    refundNumber: {
      type: String,
      required: [true, 'Refund number is required'],
      trim: true
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
      index: true
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
      default: null
    },
    customerName: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Refund amount is required'],
      min: [0.01, 'Refund amount must be greater than 0']
    },
    refundDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Reason for refund is required'],
      trim: true
    },
    refundMethod: {
      type: String,
      default: 'BANK_TRANSFER'
    },
    referenceNumber: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['PROCESSED', 'PENDING', 'REJECTED'],
      default: 'PROCESSED',
      index: true
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

RefundSchema.index({ businessId: 1, refundNumber: 1 }, { unique: true });
RefundSchema.index({ businessId: 1, refundDate: -1 });

export const Refund: Model<IRefundDocument> =
  mongoose.models.Refund || mongoose.model<IRefundDocument>('Refund', RefundSchema);

export default Refund;

