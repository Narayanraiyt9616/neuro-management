import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IOrderDocument extends Document {
  businessId: Types.ObjectId;
  orderNumber: string;
  customerId?: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  orderDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      trim: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
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
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
      index: true
    },
    orderDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

OrderSchema.index({ businessId: 1, orderDate: -1 });
OrderSchema.index({ businessId: 1, status: 1 });
OrderSchema.index({ businessId: 1, paymentStatus: 1 });

export const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;

