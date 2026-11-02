import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export type PurchaseOrderPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface IPurchaseOrderItem {
  productId: Types.ObjectId;
  productName: string;
  sku?: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface IReceiveReceipt {
  receivedDate: Date;
  items: Array<{
    productId: Types.ObjectId;
    quantityReceived: number;
  }>;
  receivedBy?: Types.ObjectId | null;
  notes?: string;
}

export interface IPurchaseOrderDocument extends Document {
  businessId: Types.ObjectId;
  poNumber: string;
  supplierId: Types.ObjectId;
  supplierName: string;
  warehouseId?: Types.ObjectId | null;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  items: IPurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  status: PurchaseOrderStatus;
  paymentStatus: PurchaseOrderPaymentStatus;
  notes?: string;
  approvedBy?: Types.ObjectId | null;
  approvedAt?: Date | null;
  receiveHistory: IReceiveReceipt[];
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
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
    sku: {
      type: String,
      default: '',
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const ReceiveReceiptSchema = new Schema<IReceiveReceipt>(
  {
    receivedDate: {
      type: Date,
      default: Date.now
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantityReceived: { type: Number, required: true, min: 1 }
      }
    ],
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const PurchaseOrderSchema = new Schema<IPurchaseOrderDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    poNumber: {
      type: String,
      required: [true, 'Purchase order number is required'],
      trim: true
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
      index: true
    },
    supplierName: {
      type: String,
      required: true,
      trim: true
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
      index: true
    },
    orderDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    expectedDeliveryDate: {
      type: Date,
      default: null
    },
    items: {
      type: [PurchaseOrderItemSchema],
      validate: [(val: IPurchaseOrderItem[]) => val.length > 0, 'PO must contain at least one item']
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
      default: 'DRAFT',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID'],
      default: 'UNPAID',
      index: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    receiveHistory: {
      type: [ReceiveReceiptSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

PurchaseOrderSchema.index({ businessId: 1, poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ businessId: 1, status: 1 });
PurchaseOrderSchema.index({ businessId: 1, orderDate: -1 });

export const PurchaseOrder: Model<IPurchaseOrderDocument> =
  mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrderDocument>('PurchaseOrder', PurchaseOrderSchema);

export default PurchaseOrder;

