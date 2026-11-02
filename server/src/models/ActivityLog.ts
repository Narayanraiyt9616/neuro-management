import mongoose, { Schema, Model } from 'mongoose';
import { IActivityLogDocument } from '../types';

const ActivityLogSchema = new Schema<IActivityLogDocument>({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    default: null,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  action: {
    type: String,
    required: [true, 'Action name is required'],
    trim: true
  },
  module: {
    type: String,
    enum: [
      'auth',
      'business',
      'billing',
      'inventory',
      'sales',
      'workforce',
      'settings',
      'system',
      'admin',
      'crm',
      'projects',
      'finance',
      'hr'
    ],
    default: 'system'
  },
  entityType: {
    type: String,
    trim: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    default: null
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Auto-expire logs after 1 year to keep DB lean & performant
ActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const ActivityLog: Model<IActivityLogDocument> = mongoose.model<IActivityLogDocument>('ActivityLog', ActivityLogSchema);
export default ActivityLog;

