import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type DocumentCategory =
  | 'REQUIREMENTS'
  | 'DESIGN'
  | 'SPECIFICATION'
  | 'CONTRACT'
  | 'REPORT'
  | 'ATTACHMENT'
  | 'OTHER';

export interface IProjectDocumentDocument extends Document {
  businessId: Types.ObjectId;
  projectId?: Types.ObjectId;
  taskId?: Types.ObjectId;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  uploadedById?: Types.ObjectId;
  uploadedByName?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectDocumentSchema = new Schema<IProjectDocumentDocument>(
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
      index: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL or storage path is required'],
      trim: true
    },
    fileType: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      default: 0,
      min: 0
    },
    category: {
      type: String,
      enum: ['REQUIREMENTS', 'DESIGN', 'SPECIFICATION', 'CONTRACT', 'REPORT', 'ATTACHMENT', 'OTHER'],
      default: 'OTHER',
      index: true
    },
    uploadedById: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedByName: {
      type: String,
      trim: true
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

ProjectDocumentSchema.index({ businessId: 1, projectId: 1, category: 1 });
ProjectDocumentSchema.index({ businessId: 1, taskId: 1 });

export const ProjectDocument: Model<IProjectDocumentDocument> =
  mongoose.models.ProjectDocument || mongoose.model<IProjectDocumentDocument>('ProjectDocument', ProjectDocumentSchema);

export default ProjectDocument;

