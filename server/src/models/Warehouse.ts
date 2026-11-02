import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IWarehouseDocument extends Document {
  businessId: Types.ObjectId;
  branchId?: Types.ObjectId | null;
  code: string;
  name: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contactPhone?: string;
  contactEmail?: string;
  managerId?: Types.ObjectId | null;
  isPrimary: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  totalProductsCount: number;
  totalStockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouseDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true
    },
    code: {
      type: String,
      required: [true, 'Warehouse code is required'],
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'India' }
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true
    },
    totalProductsCount: {
      type: Number,
      default: 0
    },
    totalStockQuantity: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

WarehouseSchema.index({ businessId: 1, code: 1 }, { unique: true });
WarehouseSchema.index({ businessId: 1, isPrimary: 1 });

export const Warehouse: Model<IWarehouseDocument> =
  mongoose.models.Warehouse || mongoose.model<IWarehouseDocument>('Warehouse', WarehouseSchema);

export default Warehouse;

