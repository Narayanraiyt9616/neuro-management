import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDepartmentDocument extends Document {
  businessId: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  managerId?: Types.ObjectId;
  budget?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    budget: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

DepartmentSchema.index({ businessId: 1, code: 1 }, { unique: true });
DepartmentSchema.index({ businessId: 1, name: 1 });

export const Department: Model<IDepartmentDocument> =
  mongoose.models.Department || mongoose.model<IDepartmentDocument>('Department', DepartmentSchema);

export default Department;

