import mongoose, { Schema, Model } from 'mongoose';
import { ISupportTicketDocument } from '../types';

const TicketMessageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      default: 'CUSTOMER'
    },
    senderName: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    attachments: {
      type: [String],
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const SupportTicketSchema = new Schema<ISupportTicketDocument>(
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
      required: [true, 'Customer reference is required'],
      index: true
    },
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      trim: true,
      uppercase: true
    },
    title: {
      type: String,
      required: [true, 'Ticket subject is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Ticket details are required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['BILLING', 'ORDER', 'TECHNICAL', 'GENERAL'],
      default: 'GENERAL',
      index: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    messages: {
      type: [TicketMessageSchema],
      default: []
    },
    slaDueAt: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h SLA default
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

SupportTicketSchema.index({ businessId: 1, ticketNumber: 1 }, { unique: true });
SupportTicketSchema.index({ businessId: 1, customerId: 1, status: 1 });
SupportTicketSchema.index({ businessId: 1, status: 1, createdAt: -1 });

const SupportTicket: Model<ISupportTicketDocument> =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicketDocument>('SupportTicket', SupportTicketSchema);

export default SupportTicket;

