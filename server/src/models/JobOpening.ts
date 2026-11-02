import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IJobOpeningDocument extends Document {
  businessId: Types.ObjectId;
  departmentId?: Types.ObjectId;
  departmentName: string;
  title: string;
  description: string;
  qualifications: string[];
  experienceYears: number;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  positionsCount: number;
  status: 'OPEN' | 'CLOSED' | 'ACTIVE' | 'DRAFT' | 'ON_HOLD';
  createdAt: Date;
  updatedAt: Date;
}

const JobOpeningSchema = new Schema<IJobOpeningDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    departmentName: {
      type: String,
      default: 'General'
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true
    },
    qualifications: {
      type: [String],
      default: []
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: 0
    },
    salaryRange: {
      min: { type: Number, default: 4000 },
      max: { type: Number, default: 8000 },
      currency: { type: String, default: 'USD' }
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
      default: 'FULL_TIME'
    },
    positionsCount: {
      type: Number,
      default: 1,
      min: 1
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'ACTIVE', 'DRAFT', 'ON_HOLD'],
      default: 'OPEN',
      index: true
    }
  },
  {
    timestamps: true
  }
);

JobOpeningSchema.index({ businessId: 1, status: 1 });

export const JobOpening: Model<IJobOpeningDocument> =
  mongoose.models.JobOpening || mongoose.model<IJobOpeningDocument>('JobOpening', JobOpeningSchema);

export default JobOpening;
