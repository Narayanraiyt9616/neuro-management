import mongoose, { Schema, Model } from 'mongoose';
import { IBranchDocument } from '../types';

const BranchSchema = new Schema<IBranchDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    code: {
      type: String,
      required: [true, 'Branch code is required'],
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['HEADQUARTERS', 'RETAIL_STORE', 'WAREHOUSE_DEPOT', 'REGIONAL_OFFICE'],
      default: 'RETAIL_STORE'
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    address: {
      street: { type: String, default: '', trim: true },
      city: { type: String, default: '', trim: true },
      state: { type: String, default: '', trim: true },
      postalCode: { type: String, default: '', trim: true },
      country: { type: String, default: 'India', trim: true }
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true
    },
    taxNumber: {
      type: String,
      default: '',
      trim: true
    },
    isMainBranch: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true
    },
    operatingHours: {
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' },
      workingDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      }
    },
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

BranchSchema.index({ businessId: 1, code: 1 }, { unique: true });
BranchSchema.index({ businessId: 1, isMainBranch: 1 });

export const Branch: Model<IBranchDocument> =
  mongoose.models.Branch || mongoose.model<IBranchDocument>('Branch', BranchSchema);

export default Branch;

