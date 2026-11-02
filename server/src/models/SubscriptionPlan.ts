import mongoose, { Schema, Model } from 'mongoose';
import { ISubscriptionPlanDocument } from '../types';

const SubscriptionPlanSchema = new Schema<ISubscriptionPlanDocument>({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  code: {
    type: String,
    enum: ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
    required: [true, 'Plan code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
    trim: true
  },
  monthlyPrice: {
    type: Number,
    required: true,
    default: 0
  },
  yearlyPrice: {
    type: Number,
    required: true,
    default: 0
  },
  employeeLimit: {
    type: Number,
    required: true,
    default: 5
  },
  storageLimitGb: {
    type: Number,
    required: true,
    default: 2
  },
  moduleAccess: {
    type: [String],
    default: ['dashboard', 'invoicing']
  },
  features: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const SubscriptionPlan: Model<ISubscriptionPlanDocument> =
  mongoose.model<ISubscriptionPlanDocument>('SubscriptionPlan', SubscriptionPlanSchema);

export default SubscriptionPlan;

