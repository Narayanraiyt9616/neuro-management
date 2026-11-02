import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type SalesActivityType =
  | 'EMAIL'
  | 'CALL'
  | 'MEETING'
  | 'NOTE'
  | 'STATUS_CHANGE'
  | 'ORDER_CREATED'
  | 'LEAD_CONVERTED'
  | 'SYSTEM';

export interface ISalesActivityDocument extends Document {
  businessId: Types.ObjectId;
  customerId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  salesOrderId?: Types.ObjectId;
  type: SalesActivityType;
  subject: string;
  description: string;
  metadata?: Record<string, unknown>;
  performedBy?: Types.ObjectId;
  performedByName?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SalesActivitySchema = new Schema<ISalesActivityDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true
    },
    salesOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'SalesOrder',
      default: null,
      index: true
    },
    type: {
      type: String,
      enum: ['EMAIL', 'CALL', 'MEETING', 'NOTE', 'STATUS_CHANGE', 'ORDER_CREATED', 'LEAD_CONVERTED', 'SYSTEM'],
      default: 'NOTE',
      index: true
    },
    subject: {
      type: String,
      required: [true, 'Activity subject is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    performedByName: {
      type: String,
      default: 'System User'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

SalesActivitySchema.index({ businessId: 1, customerId: 1, timestamp: -1 });
SalesActivitySchema.index({ businessId: 1, leadId: 1, timestamp: -1 });

export const SalesActivity: Model<ISalesActivityDocument> =
  mongoose.models.SalesActivity || mongoose.model<ISalesActivityDocument>('SalesActivity', SalesActivitySchema);

export default SalesActivity;

