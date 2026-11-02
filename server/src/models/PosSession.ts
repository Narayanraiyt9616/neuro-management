import mongoose, { Schema, Model } from 'mongoose';
import { IPosSessionDocument } from '../types';

const PosSessionSchema = new Schema<IPosSessionDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch reference is required'],
      index: true
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier reference is required'],
      index: true
    },
    registerName: {
      type: String,
      required: [true, 'Register name is required'],
      trim: true,
      default: 'Main Counter Register'
    },
    sessionCode: {
      type: String,
      required: [true, 'Session code is required'],
      trim: true,
      uppercase: true
    },
    openingBalance: {
      type: Number,
      required: [true, 'Opening cash float is required'],
      min: [0, 'Opening balance cannot be negative'],
      default: 0
    },
    closingBalance: {
      type: Number,
      default: null
    },
    expectedCashBalance: {
      type: Number,
      default: 0
    },
    cashDiscrepancy: {
      type: Number,
      default: 0
    },
    totalSalesAmount: {
      type: Number,
      default: 0
    },
    totalTransactionsCount: {
      type: Number,
      default: 0
    },
    totalCashSales: {
      type: Number,
      default: 0
    },
    totalCardSales: {
      type: Number,
      default: 0
    },
    totalUpiSales: {
      type: Number,
      default: 0
    },
    cashInAmount: {
      type: Number,
      default: 0
    },
    cashOutAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['OPEN', 'SUSPENDED', 'CLOSED'],
      default: 'OPEN',
      index: true
    },
    openedAt: {
      type: Date,
      default: Date.now
    },
    closedAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

PosSessionSchema.index({ businessId: 1, sessionCode: 1 }, { unique: true });
PosSessionSchema.index({ businessId: 1, branchId: 1, status: 1 });
PosSessionSchema.index({ businessId: 1, cashierId: 1, status: 1 });

const PosSession: Model<IPosSessionDocument> =
  mongoose.models.PosSession || mongoose.model<IPosSessionDocument>('PosSession', PosSessionSchema);

export default PosSession;

