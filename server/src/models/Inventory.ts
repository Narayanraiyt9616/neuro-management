import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IInventoryDocument extends Document {
  businessId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  productId: Types.ObjectId;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  locationInWarehouse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventoryDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse reference is required'],
      index: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true
    },
    currentStock: {
      type: Number,
      required: true,
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
    locationInWarehouse: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

InventorySchema.pre('save', function (next) {
  const reserved = Math.max(0, this.reservedStock || 0);
  this.reservedStock = reserved;
  this.availableStock = Math.max(0, this.currentStock - reserved);
  next();
});

InventorySchema.index({ businessId: 1, warehouseId: 1, productId: 1 }, { unique: true });
InventorySchema.index({ businessId: 1, productId: 1 });

export const Inventory: Model<IInventoryDocument> =
  mongoose.models.Inventory || mongoose.model<IInventoryDocument>('Inventory', InventorySchema);

export default Inventory;

