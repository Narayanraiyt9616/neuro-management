import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'BLOCKED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ITaskAttachment {
  name: string;
  url: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: Date;
}

export interface ITaskHistoryItem {
  action: string;
  fromStatus?: string;
  toStatus?: string;
  performedBy: string;
  timestamp: Date;
  notes?: string;
}

export interface ITaskDocument extends Document {
  businessId: Types.ObjectId;
  projectId: Types.ObjectId;
  taskNumber: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline: Date;
  status: TaskStatus;
  assignedToId?: Types.ObjectId;
  assignedToName?: string;
  assignedToEmail?: string;
  createdById?: Types.ObjectId;
  createdByName?: string;
  estimatedHours?: number;
  loggedHours?: number;
  attachments: ITaskAttachment[];
  commentsCount: number;
  history: ITaskHistoryItem[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskAttachmentSchema = new Schema<ITaskAttachment>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const TaskHistoryItemSchema = new Schema<ITaskHistoryItem>(
  {
    action: { type: String, required: true },
    fromStatus: { type: String },
    toStatus: { type: String },
    performedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  },
  { _id: false }
);

const TaskSchema = new Schema<ITaskDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true
    },
    taskNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true
    },
    deadline: {
      type: Date,
      required: [true, 'Task deadline is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED'],
      default: 'TODO',
      index: true
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    assignedToName: {
      type: String,
      trim: true
    },
    assignedToEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdByName: {
      type: String,
      trim: true
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0
    },
    loggedHours: {
      type: Number,
      default: 0,
      min: 0
    },
    attachments: {
      type: [TaskAttachmentSchema],
      default: []
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    history: {
      type: [TaskHistoryItemSchema],
      default: []
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

TaskSchema.index({ businessId: 1, projectId: 1, status: 1 });
TaskSchema.index({ businessId: 1, assignedToId: 1 });
TaskSchema.index({ businessId: 1, deadline: 1 });

export const Task: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema);

export default Task;

