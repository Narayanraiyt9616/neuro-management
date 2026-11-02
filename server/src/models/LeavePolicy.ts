import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILeavePolicyDocument extends Document {
  businessId: Types.ObjectId;
  casualLeaveQuota: number;
  sickLeaveQuota: number;
  earnedLeaveQuota: number;
  unpaidLeaveAllowed: boolean;
  carryForwardLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeavePolicySchema = new Schema<ILeavePolicyDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true,
      unique: true
    },
    casualLeaveQuota: {
      type: Number,
      default: 12,
      min: 0
    },
    sickLeaveQuota: {
      type: Number,
      default: 10,
      min: 0
    },
    earnedLeaveQuota: {
      type: Number,
      default: 15,
      min: 0
    },
    unpaidLeaveAllowed: {
      type: Boolean,
      default: true
    },
    carryForwardLimit: {
      type: Number,
      default: 5,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export const LeavePolicy: Model<ILeavePolicyDocument> =
  mongoose.models.LeavePolicy || mongoose.model<ILeavePolicyDocument>('LeavePolicy', LeavePolicySchema);

export default LeavePolicy;

