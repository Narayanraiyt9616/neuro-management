import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProductCategoryDocument extends Document {
  businessId: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductCategorySchema = new Schema<IProductCategoryDocument>(
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
      default: '',
      trim: true
    },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductCategory',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

ProductCategorySchema.index({ businessId: 1, name: 1 }, { unique: true });
ProductCategorySchema.index({ businessId: 1, code: 1 }, { unique: true });

export const ProductCategory: Model<IProductCategoryDocument> =
  mongoose.models.ProductCategory ||
  mongoose.model<IProductCategoryDocument>('ProductCategory', ProductCategorySchema);

export default ProductCategory;

