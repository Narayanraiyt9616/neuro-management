import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type LeadSource =
  | 'Website'
  | 'Social Media'
  | 'Referral'
  | 'Advertisement'
  | 'Direct Contact'
  | 'Other';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export interface ILeadDocument extends Document {
  businessId: Types.ObjectId;
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  assignedEmployeeId?: Types.ObjectId;
  assignedEmployeeName?: string;
  leadValue: number;
  expectedClosingDate?: Date;
  notes?: string;
  status: LeadStatus;
  convertedCustomerId?: Types.ObjectId;
  convertedOrderId?: Types.ObjectId;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILeadDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    leadId: {
      type: String,
      required: [true, 'Lead ID is required'],
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      enum: ['Website', 'Social Media', 'Referral', 'Advertisement', 'Direct Contact', 'Other'],
      default: 'Website',
      index: true
    },
    assignedEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    assignedEmployeeName: {
      type: String,
      default: ''
    },
    leadValue: {
      type: Number,
      default: 0,
      min: 0
    },
    expectedClosingDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'],
      default: 'NEW',
      index: true
    },
    convertedCustomerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    convertedOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'SalesOrder',
      default: null
    },
    convertedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

LeadSchema.index({ businessId: 1, leadId: 1 }, { unique: true });
LeadSchema.index({ businessId: 1, status: 1 });
LeadSchema.index({ businessId: 1, assignedEmployeeId: 1 });
LeadSchema.index({ businessId: 1, createdAt: -1 });

export const Lead: Model<ILeadDocument> =
  mongoose.models.Lead || mongoose.model<ILeadDocument>('Lead', LeadSchema);

export default Lead;

