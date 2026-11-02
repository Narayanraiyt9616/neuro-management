import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ProjectMemberRole =
  | 'PROJECT_MANAGER'
  | 'TEAM_LEAD'
  | 'DEVELOPER'
  | 'DESIGNER'
  | 'QA'
  | 'CONTRIBUTOR'
  | 'VIEWER';

export interface IProjectMemberDocument extends Document {
  businessId: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  employeeId?: Types.ObjectId;
  name: string;
  email: string;
  role: ProjectMemberRole;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMemberDocument>(
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'DESIGNER', 'QA', 'CONTRIBUTOR', 'VIEWER'],
      default: 'CONTRIBUTOR'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

ProjectMemberSchema.index({ businessId: 1, projectId: 1, userId: 1 }, { unique: true });

export const ProjectMember: Model<IProjectMemberDocument> =
  mongoose.models.ProjectMember || mongoose.model<IProjectMemberDocument>('ProjectMember', ProjectMemberSchema);

export default ProjectMember;

