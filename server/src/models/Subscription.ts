import mongoose, { Schema, Model } from 'mongoose';
import { ISubscriptionDocument } from '../types';

const SubscriptionSchema = new Schema<ISubscriptionDocument>({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: [
      'FREE',
      'STARTER',
      'PROFESSIONAL',
      'ENTERPRISE',
      'free',
      'starter',
      'professional',
      'enterprise'
    ],
    default: 'STARTER'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: [
      'ACTIVE',
      'TRIALING',
      'EXPIRED',
      'CANCELED',
      'PAST_DUE',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid'
    ],
    default: 'ACTIVE'
  },
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'razorpay', 'manual', null],
    default: null
  },
  paymentOrderId: {
    type: String,
    default: null
  },
  lastPaymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', null],
    default: null
  },
  limits: {
    maxUsers: { type: Number, default: 5 },
    maxInvoicesPerMonth: { type: Number, default: 100 },
    storageLimitMb: { type: Number, default: 1024 },
    multiCurrency: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    dedicatedAccountManager: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });

export const Subscription: Model<ISubscriptionDocument> =
  mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);

export default Subscription;
