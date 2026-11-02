import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type LeaveType = 'CASUAL_LEAVE' | 'SICK_LEAVE' | 'EARNED_LEAVE' | 'UNPAID_LEAVE';
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ILeaveRequestDocument extends Document {
  businessId: Types.ObjectId;
  employeeId: Types.ObjectId;
  userId?: Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  daysCount: number;
  reason: string;
  status: LeaveRequestStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequestDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    leaveType: {
      type: String,
      enum: ['CASUAL_LEAVE', 'SICK_LEAVE', 'EARNED_LEAVE', 'UNPAID_LEAVE'],
      required: [true, 'Leave type is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    daysCount: {
      type: Number,
      required: true,
      min: 0.5
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

LeaveRequestSchema.index({ businessId: 1, employeeId: 1, status: 1 });
LeaveRequestSchema.index({ businessId: 1, startDate: -1 });

export const LeaveRequest: Model<ILeaveRequestDocument> =
  mongoose.models.LeaveRequest || mongoose.model<ILeaveRequestDocument>('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;

