import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface ISupplierDocument extends Document {
  businessId: Types.ObjectId;
  supplierCode: string;
  supplierName: string;
  companyName: string;
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  gstin?: string;
  contactPerson?: string;
  paymentTerms: string;
  status: SupplierStatus;
  totalPurchases: number;
  totalPaid: number;
  outstandingBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplierDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    supplierCode: {
      type: String,
      required: [true, 'Supplier code is required'],
      trim: true,
      uppercase: true
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Supplier email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Supplier phone is required'],
      trim: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'India' }
    },
    gstin: {
      type: String,
      default: '',
      trim: true,
      uppercase: true
    },
    contactPerson: {
      type: String,
      default: '',
      trim: true
    },
    paymentTerms: {
      type: String,
      default: 'Net 30',
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
      default: 'ACTIVE',
      index: true
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    outstandingBalance: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

SupplierSchema.index({ businessId: 1, supplierCode: 1 }, { unique: true });
SupplierSchema.index({ businessId: 1, email: 1 });
SupplierSchema.index({ businessId: 1, status: 1 });

export const Supplier: Model<ISupplierDocument> =
  mongoose.models.Supplier || mongoose.model<ISupplierDocument>('Supplier', SupplierSchema);

export default Supplier;

