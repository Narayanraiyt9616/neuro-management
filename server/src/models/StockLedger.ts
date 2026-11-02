import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type StockMovementType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'PURCHASE_RECEIPT'
  | 'SALES_FULFILLMENT'
  | 'SALES_RETURN'
  | 'RESERVATION'
  | 'RESERVATION_RELEASE';

export type StockReferenceType =
  | 'PURCHASE_ORDER'
  | 'SALES_ORDER'
  | 'STOCK_TRANSFER'
  | 'MANUAL_ADJUSTMENT'
  | 'INITIAL_STOCK';

export interface IStockLedgerDocument extends Document {
  businessId: Types.ObjectId;
  productId: Types.ObjectId;
  warehouseId?: Types.ObjectId | null;
  movementType: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: StockReferenceType;
  referenceId?: string;
  idempotencyKey?: string;
  notes?: string;
  performedBy?: Types.ObjectId | null;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StockLedgerSchema = new Schema<IStockLedgerDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
      index: true
    },
    movementType: {
      type: String,
      enum: [
        'STOCK_IN',
        'STOCK_OUT',
        'ADJUSTMENT',
        'TRANSFER_IN',
        'TRANSFER_OUT',
        'PURCHASE_RECEIPT',
        'SALES_FULFILLMENT',
        'SALES_RETURN',
        'RESERVATION',
        'RESERVATION_RELEASE'
      ],
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    referenceType: {
      type: String,
      enum: [
        'PURCHASE_ORDER',
        'SALES_ORDER',
        'STOCK_TRANSFER',
        'MANUAL_ADJUSTMENT',
        'INITIAL_STOCK'
      ],
      required: true
    },
    referenceId: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    idempotencyKey: {
      type: String,
      trim: true,
      sparse: true,
      index: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

StockLedgerSchema.index({ businessId: 1, productId: 1, timestamp: -1 });
StockLedgerSchema.index({ businessId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

export const StockLedger: Model<IStockLedgerDocument> =
  mongoose.models.StockLedger || mongoose.model<IStockLedgerDocument>('StockLedger', StockLedgerSchema);

export default StockLedger;

