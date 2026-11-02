import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type NotificationType =
  | 'LEAVE_APPLICATION'
  | 'LEAVE_STATUS'
  | 'ATTENDANCE_REMINDER'
  | 'EMPLOYEE_ONBOARDED'
  | 'PAYROLL_GENERATED'
  | 'INTERVIEW_SCHEDULED'
  | 'LEAVE'
  | 'ATTENDANCE'
  | 'RECRUITMENT'
  | 'PAYROLL'
  | 'EMPLOYEE'
  | 'CRM'
  | 'SALES'
  | 'LEAD'
  | 'FOLLOW_UP'
  | 'ORDER'
  | 'LOW_STOCK'
  | 'INVENTORY'
  | 'PURCHASE'
  | 'INVOICE'
  | 'PAYMENT'
  | 'EXPENSE'
  | 'FINANCE'
  | 'TASK_ASSIGNMENT'
  | 'TASK_DEADLINE'
  | 'TASK_OVERDUE'
  | 'PROJECT_ASSIGNMENT'
  | 'PROJECT_STATUS'
  | 'NEW_COMMENT'
  | 'MENTION'
  | 'PROJECT'
  | 'TASK'
  | 'SYSTEM';



export interface INotificationDocument extends Document {
  businessId: Types.ObjectId;
  recipientUserId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user reference is required'],
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'LEAVE_APPLICATION',
        'LEAVE_STATUS',
        'ATTENDANCE_REMINDER',
        'EMPLOYEE_ONBOARDED',
        'PAYROLL_GENERATED',
        'INTERVIEW_SCHEDULED',
        'LEAVE',
        'ATTENDANCE',
        'RECRUITMENT',
        'PAYROLL',
        'EMPLOYEE',
        'CRM',
        'SALES',
        'LEAD',
        'FOLLOW_UP',
        'ORDER',
        'LOW_STOCK',
        'INVENTORY',
        'PURCHASE',
        'INVOICE',
        'PAYMENT',
        'EXPENSE',
        'FINANCE',
        'TASK_ASSIGNMENT',
        'TASK_DEADLINE',
        'TASK_OVERDUE',
        'PROJECT_ASSIGNMENT',
        'PROJECT_STATUS',
        'NEW_COMMENT',
        'MENTION',
        'PROJECT',
        'TASK',
        'SYSTEM'
      ],
      default: 'SYSTEM',
      index: true
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ businessId: 1, recipientUserId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotificationDocument> =
  mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export default Notification;
