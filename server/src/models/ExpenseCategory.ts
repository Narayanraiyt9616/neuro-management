import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IExpenseCategoryDocument extends Document {
  businessId: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  isTaxDeductible: boolean;
  budgetLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseCategorySchema = new Schema<IExpenseCategoryDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Category code is required'],
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isTaxDeductible: {
      type: Boolean,
      default: true
    },
    budgetLimit: {
      type: Number,
      default: 0
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

// Indexes
ExpenseCategorySchema.index({ businessId: 1, name: 1 }, { unique: true });
ExpenseCategorySchema.index({ businessId: 1, code: 1 }, { unique: true });

export const ExpenseCategory: Model<IExpenseCategoryDocument> =
  mongoose.models.ExpenseCategory ||
  mongoose.model<IExpenseCategoryDocument>('ExpenseCategory', ExpenseCategorySchema);

export default ExpenseCategory;

