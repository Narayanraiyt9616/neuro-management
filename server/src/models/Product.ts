import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProductDocument extends Document {
  businessId: Types.ObjectId;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  categoryId?: Types.ObjectId | null;
  price: number;
  cost: number;
  taxRate: number;
  stockQuantity: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  minStockThreshold: number;
  suggestedReorderQuantity: number;
  unit: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description?: string;
  productImage?: string;
  supplierId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'SKU code is required'],
      trim: true,
      uppercase: true
    },
    barcode: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      index: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductCategory',
      default: null,
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 0
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0
    },
    availableStock: {
      type: Number,
      default: 0
    },
    reorderPoint: {
      type: Number,
      default: 10,
      min: 0
    },
    minStockThreshold: {
      type: Number,
      default: 10,
      min: 0
    },
    suggestedReorderQuantity: {
      type: Number,
      default: 20,
      min: 0
    },
    unit: {
      type: String,
      default: 'units',
      trim: true
    },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    productImage: {
      type: String,
      trim: true,
      default: ''
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Middleware to calculate availableStock, status, and suggestedReorderQuantity dynamically
ProductSchema.pre('save', function (next) {
  // Sync minStockThreshold and reorderPoint
  if (this.minStockThreshold !== undefined && this.minStockThreshold !== this.reorderPoint) {
    this.reorderPoint = this.minStockThreshold;
  } else if (this.reorderPoint !== undefined) {
    this.minStockThreshold = this.reorderPoint;
  }

  // Calculate available stock
  const reserved = Math.max(0, this.reservedStock || 0);
  this.reservedStock = reserved;
  this.availableStock = Math.max(0, this.stockQuantity - reserved);

  // Suggested reorder quantity rule: target 2x reorderPoint minus availableStock
  const targetStock = (this.reorderPoint || 10) * 2;
  this.suggestedReorderQuantity = Math.max(0, targetStock - this.availableStock);

  // Status calculation based on availableStock & reorderPoint
  if (this.availableStock <= 0) {
    this.status = 'out_of_stock';
  } else if (this.availableStock <= this.reorderPoint) {
    this.status = 'low_stock';
  } else {
    this.status = 'in_stock';
  }

  next();
});

ProductSchema.index({ businessId: 1, sku: 1 });
ProductSchema.index({ businessId: 1, stockQuantity: 1 });
ProductSchema.index({ businessId: 1, availableStock: 1 });
ProductSchema.index({ businessId: 1, status: 1 });

export const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
