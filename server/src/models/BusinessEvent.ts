import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type BusinessEventType =
  | 'MEETING'
  | 'DEADLINE'
  | 'MILESTONE'
  | 'HOLIDAY'
  | 'COMPANY_EVENT'
  | 'REVIEW';

export interface IBusinessEventAttendee {
  userId?: Types.ObjectId;
  name: string;
  email: string;
}

export interface IBusinessEventDocument extends Document {
  businessId: Types.ObjectId;
  title: string;
  description?: string;
  eventType: BusinessEventType;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  meetingUrl?: string;
  attendees: IBusinessEventAttendee[];
  projectId?: Types.ObjectId;
  taskId?: Types.ObjectId;
  color?: string;
  createdById?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessEventAttendeeSchema = new Schema<IBusinessEventAttendee>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true }
  },
  { _id: false }
);

const BusinessEventSchema = new Schema<IBusinessEventDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    eventType: {
      type: String,
      enum: ['MEETING', 'DEADLINE', 'MILESTONE', 'HOLIDAY', 'COMPANY_EVENT', 'REVIEW'],
      default: 'MEETING',
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    allDay: {
      type: Boolean,
      default: false
    },
    location: {
      type: String,
      trim: true
    },
    meetingUrl: {
      type: String,
      trim: true
    },
    attendees: {
      type: [BusinessEventAttendeeSchema],
      default: []
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    color: {
      type: String,
      default: '#3b82f6'
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

BusinessEventSchema.index({ businessId: 1, startDate: 1, endDate: 1 });

export const BusinessEvent: Model<IBusinessEventDocument> =
  mongoose.models.BusinessEvent || mongoose.model<IBusinessEventDocument>('BusinessEvent', BusinessEventSchema);

export default BusinessEvent;

