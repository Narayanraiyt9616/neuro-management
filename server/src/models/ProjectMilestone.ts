import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'ACHIEVED' | 'MISSED';

export interface IProjectMilestoneDocument extends Document {
  businessId: Types.ObjectId;
  projectId: Types.ObjectId;
  title: string;
  description?: string;
  dueDate: Date;
  status: MilestoneStatus;
  achievedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMilestoneSchema = new Schema<IProjectMilestoneDocument>(
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
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Milestone due date is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'ACHIEVED', 'MISSED'],
      default: 'PENDING',
      index: true
    },
    achievedAt: {
      type: Date
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

ProjectMilestoneSchema.index({ businessId: 1, projectId: 1, dueDate: 1 });

export const ProjectMilestone: Model<IProjectMilestoneDocument> =
  mongoose.models.ProjectMilestone || mongoose.model<IProjectMilestoneDocument>('ProjectMilestone', ProjectMilestoneSchema);

export default ProjectMilestone;

