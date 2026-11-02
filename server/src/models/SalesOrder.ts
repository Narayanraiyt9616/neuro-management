import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type SalesOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'pending'
  | 'completed';

export type SalesOrderPaymentStatus =
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'
  | 'REFUNDED'
  | 'unpaid'
  | 'paid'
  | 'refunded';

export interface ISalesOrderItem {
  productId?: Types.ObjectId;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Item discount amount
  tax: number; // Tax rate percentage (e.g. 18 for 18%)
  itemTotal: number; // Backend computed: (qty * price - discount) + tax
}

export interface ISalesOrderDocument extends Document {
  businessId: Types.ObjectId;
  orderNumber: string;
  customerId: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: ISalesOrderItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: SalesOrderStatus;
  paymentStatus: SalesOrderPaymentStatus;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  assignedEmployeeId?: Types.ObjectId;
  notes?: string;
  inventoryDeducted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SalesOrderItemSchema = new Schema<ISalesOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null
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
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    itemTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const SalesOrderSchema = new Schema<ISalesOrderDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    orderNumber: {
      type: String,
      required: [true, 'Sales order number is required'],
      trim: true,
      index: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true
    },
    items: {
      type: [SalesOrderItemSchema],
      validate: [(val: ISalesOrderItem[]) => val.length > 0, 'Sales order must contain at least one item']
    },
    subtotal: {
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
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingFee: {
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
      enum: ['DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'pending', 'completed'],
      default: 'CONFIRMED',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED', 'unpaid', 'paid', 'refunded'],
      default: 'UNPAID',
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
    assignedEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    inventoryDeducted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

SalesOrderSchema.index({ businessId: 1, orderNumber: 1 }, { unique: true });
SalesOrderSchema.index({ businessId: 1, orderDate: -1 });
SalesOrderSchema.index({ businessId: 1, status: 1 });
SalesOrderSchema.index({ businessId: 1, customerId: 1 });

export const SalesOrder: Model<ISalesOrderDocument> =
  mongoose.models.SalesOrder || mongoose.model<ISalesOrderDocument>('SalesOrder', SalesOrderSchema);

export default SalesOrder;

