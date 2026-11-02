import mongoose, { Schema, Model } from 'mongoose';
import { IBusinessDocument } from '../types';

const BusinessSchema = new Schema<IBusinessDocument>({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [120, 'Business name cannot exceed 120 characters']
  },
  slug: {
    type: String,
    required: [true, 'Unique slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  legalName: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  gstin: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    default: 'Technology & Services',
    trim: true
  },
  category: {
    type: String,
    default: 'Information Technology',
    trim: true
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    trim: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  logo: {
    type: String,
    default: null
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  businessEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ownerName: {
    type: String,
    trim: true
  },
  ownerEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'US' }
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Business owner is required']
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  status: {
    type: String,
    enum: [
      'PENDING',
      'APPROVED',
      'REJECTED',
      'ACTIVE',
      'SUSPENDED',
      'active',
      'trial',
      'past_due',
      'suspended',
      'archived'
    ],
    default: 'PENDING'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  suspensionReason: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  suspendedAt: {
    type: Date,
    default: null
  },
  settings: {
    fiscalYearStart: { type: String, default: 'January' },
    invoicePrefix: { type: String, default: 'BNX-' },
    dateFormat: { type: String, default: 'YYYY-MM-DD' },
    multiCurrencyEnabled: { type: Boolean, default: false },
    invoiceSettings: {
      prefix: { type: String, default: 'INV-' },
      nextNumber: { type: Number, default: 1001 },
      paymentTermsDays: { type: Number, default: 30 },
      defaultNotes: { type: String, default: 'Thank you for your business!' }
    },
    notificationPreferences: {
      emailOnOrder: { type: Boolean, default: true },
      emailOnPayment: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true }
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      workDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    },
    notifications: {
      emailAlerts: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

BusinessSchema.index({ ownerId: 1 });
BusinessSchema.index({ status: 1 });

export const Business: Model<IBusinessDocument> = mongoose.model<IBusinessDocument>('Business', BusinessSchema);
export default Business;
