import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type StockTransferStatus = 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface IStockTransferItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
}

export interface IStockTransferDocument extends Document {
  businessId: Types.ObjectId;
  transferNumber: string;
  fromWarehouseId: Types.ObjectId;
  toWarehouseId: Types.ObjectId;
  items: IStockTransferItem[];
  status: StockTransferStatus;
  notes?: string;
  transferDate: Date;
  receivedDate?: Date;
  performedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const StockTransferItemSchema = new Schema<IStockTransferItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const StockTransferSchema = new Schema<IStockTransferDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    transferNumber: {
      type: String,
      required: [true, 'Transfer number is required'],
      trim: true
    },
    fromWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    toWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    items: {
      type: [StockTransferItemSchema],
      validate: [(val: IStockTransferItem[]) => val.length > 0, 'Transfer must contain at least one item']
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    transferDate: {
      type: Date,
      default: Date.now
    },
    receivedDate: {
      type: Date,
      default: null
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

StockTransferSchema.index({ businessId: 1, transferNumber: 1 }, { unique: true });
StockTransferSchema.index({ businessId: 1, status: 1 });

export const StockTransfer: Model<IStockTransferDocument> =
  mongoose.models.StockTransfer || mongoose.model<IStockTransferDocument>('StockTransfer', StockTransferSchema);

export default StockTransfer;

