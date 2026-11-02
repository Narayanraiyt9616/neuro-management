import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITaskCommentDocument extends Document {
  businessId: Types.ObjectId;
  projectId: Types.ObjectId;
  taskId: Types.ObjectId;
  authorId: Types.ObjectId;
  authorName: string;
  authorRole: string;
  content: string;
  mentions: string[];
  attachments: Array<{
    name: string;
    url: string;
    fileType: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TaskCommentSchema = new Schema<ITaskCommentDocument>(
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
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user reference is required'],
      index: true
    },
    authorName: {
      type: String,
      required: true,
      trim: true
    },
    authorRole: {
      type: String,
      default: 'EMPLOYEE'
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true
    },
    mentions: [
      {
        type: String,
        trim: true
      }
    ],
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        fileType: { type: String, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

TaskCommentSchema.index({ businessId: 1, taskId: 1, createdAt: 1 });

export const TaskComment: Model<ITaskCommentDocument> =
  mongoose.models.TaskComment || mongoose.model<ITaskCommentDocument>('TaskComment', TaskCommentSchema);

export default TaskComment;

