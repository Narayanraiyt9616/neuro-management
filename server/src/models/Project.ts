import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface IProjectMemberEmbedded {
  userId: Types.ObjectId;
  employeeId?: Types.ObjectId;
  name: string;
  email: string;
  role: 'PROJECT_MANAGER' | 'TEAM_LEAD' | 'DEVELOPER' | 'DESIGNER' | 'QA' | 'CONTRIBUTOR' | 'VIEWER';
  assignedAt: Date;
}

export interface IProjectHistoryItem {
  action: string;
  performedBy: string;
  timestamp: Date;
  details?: string;
}

export interface IProjectDocument extends Document {
  businessId: Types.ObjectId;
  projectCode: string;
  name: string;
  description?: string;
  projectManagerId?: Types.ObjectId;
  projectManagerName?: string;
  startDate: Date;
  endDate?: Date;
  budget: number;
  spent: number;
  priority: ProjectPriority;
  status: ProjectStatus | string;
  assignedEmployees: Types.ObjectId[];
  members: IProjectMemberEmbedded[];
  progress: number;
  client?: string;
  customerId?: Types.ObjectId;
  tags?: string[];
  history: IProjectHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberEmbeddedSchema = new Schema<IProjectMemberEmbedded>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: {
      type: String,
      enum: ['PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'DESIGNER', 'QA', 'CONTRIBUTOR', 'VIEWER'],
      default: 'CONTRIBUTOR'
    },
    assignedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ProjectHistoryItemSchema = new Schema<IProjectHistoryItem>(
  {
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String }
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProjectDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    projectCode: {
      type: String,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    projectManagerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    projectManagerName: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    endDate: {
      type: Date,
      default: null
    },
    budget: {
      type: Number,
      default: 0,
      min: 0
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'planned', 'active', 'in_progress', 'completed', 'on_hold'],
      default: 'ACTIVE',
      index: true
    },
    assignedEmployees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    members: {
      type: [ProjectMemberEmbeddedSchema],
      default: []
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    client: {
      type: String,
      trim: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    history: {
      type: [ProjectHistoryItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

ProjectSchema.index({ businessId: 1, status: 1 });
ProjectSchema.index({ businessId: 1, projectManagerId: 1 });

export const Project: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>('Project', ProjectSchema);

export default Project;
