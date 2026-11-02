import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type FollowUpType = 'CALL' | 'MEETING' | 'EMAIL' | 'DEMO' | 'FOLLOW_UP';

export interface IFollowUpDocument extends Document {
  businessId: Types.ObjectId;
  leadId?: Types.ObjectId;
  customerId?: Types.ObjectId;
  title: string;
  type: FollowUpType;
  scheduledDate: Date;
  nextFollowUpDate?: Date;
  notes?: string;
  status: FollowUpStatus;
  assignedEmployeeId?: Types.ObjectId;
  assignedEmployeeName?: string;
  reminderSent: boolean;
  completedAt?: Date;
  outcomeNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUpDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Follow-up title is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['CALL', 'MEETING', 'EMAIL', 'DEMO', 'FOLLOW_UP'],
      default: 'FOLLOW_UP',
      index: true
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled follow-up date is required'],
      index: true
    },
    nextFollowUpDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
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
    reminderSent: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    outcomeNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

FollowUpSchema.index({ businessId: 1, scheduledDate: 1 });
FollowUpSchema.index({ businessId: 1, status: 1 });

export const FollowUp: Model<IFollowUpDocument> =
  mongoose.models.FollowUp || mongoose.model<IFollowUpDocument>('FollowUp', FollowUpSchema);

export default FollowUp;

