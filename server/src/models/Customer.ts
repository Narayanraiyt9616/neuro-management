import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type CustomerType = 'INDIVIDUAL' | 'BUSINESS' | 'ENTERPRISE' | 'RETAIL' | 'WHOLESALE';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'BLOCKED' | 'active' | 'inactive';

export interface ICustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface ICustomerDocument extends Document {
  businessId: Types.ObjectId;
  customerId: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  companyName?: string;
  gstin?: string;
  address?: ICustomerAddress;
  customerType: CustomerType;
  registrationDate: Date;
  totalSpent: number;
  ordersCount: number;
  status: CustomerStatus;
  notes?: string;
  userId?: Types.ObjectId;
  assignedEmployeeId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerAddressSchema = new Schema<ICustomerAddress>(
  {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    customerId: {
      type: String,
      required: [true, 'Customer ID is required'],
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    fullName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    companyName: {
      type: String,
      trim: true
    },
    gstin: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: CustomerAddressSchema,
      default: () => ({ country: 'India' })
    },
    customerType: {
      type: String,
      enum: ['INDIVIDUAL', 'BUSINESS', 'ENTERPRISE', 'RETAIL', 'WHOLESALE'],
      default: 'BUSINESS',
      index: true
    },
    registrationDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    ordersCount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'LEAD', 'BLOCKED', 'active', 'inactive'],
      default: 'ACTIVE',
      index: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    }
  },
  {
    timestamps: true
  }
);

CustomerSchema.index({ businessId: 1, customerId: 1 }, { unique: true });
CustomerSchema.index({ businessId: 1, email: 1 });
CustomerSchema.index({ businessId: 1, createdAt: -1 });

export const Customer: Model<ICustomerDocument> =
  mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);

export default Customer;
