import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface IInvoiceItem {
  productId?: Types.ObjectId | string;
  name: string;
  description?: string;
  hsnSacCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  taxRate: number; // e.g. 18 for 18%
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTaxAmount: number;
  lineTotal: number;
}

export interface IBusinessSnapshot {
  name: string;
  legalName?: string;
  gstin?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  logo?: string;
}

export interface ICustomerSnapshot {
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  gstin?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface IInvoiceDocument extends Document {
  businessId: Types.ObjectId;
  invoiceNumber: string;
  customerId?: Types.ObjectId;
  salesOrderId?: Types.ObjectId;
  customerName: string;
  customerEmail: string;

  // Snapshots to preserve historical integrity
  businessSnapshot?: IBusinessSnapshot;
  customerSnapshot?: ICustomerSnapshot;

  // Dates
  invoiceDate: Date;
  dueDate: Date;
  issueDate?: Date; // backward compatibility
  paidAt?: Date;

  // Items
  items: IInvoiceItem[];

  // Financials & GST Breakdown
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  isInterState: boolean;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTaxAmount: number;
  tax?: number; // backward compatibility
  shippingCharges: number;
  otherCharges: number;
  grandTotal: number;
  totalAmount?: number; // backward compatibility
  amountPaid: number;
  balanceDue: number;

  // Status
  status: InvoiceStatus;

  // Terms & Notes
  paymentTerms?: string;
  notes?: string;
  termsAndConditions?: string;

  finalizedAt?: Date;
  createdBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    productId: {
      type: Schema.Types.Mixed,
      default: null
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    hsnSacCode: {
      type: String,
      trim: true,
      default: ''
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      default: 'units'
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    taxableAmount: {
      type: Number,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 0
    },
    cgstRate: {
      type: Number,
      default: 0
    },
    cgstAmount: {
      type: Number,
      default: 0
    },
    sgstRate: {
      type: Number,
      default: 0
    },
    sgstAmount: {
      type: Number,
      default: 0
    },
    igstRate: {
      type: Number,
      default: 0
    },
    igstAmount: {
      type: Number,
      default: 0
    },
    totalTaxAmount: {
      type: Number,
      default: 0
    },
    lineTotal: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoiceDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true
    },
    salesOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'SalesOrder',
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
    businessSnapshot: {
      name: String,
      legalName: String,
      gstin: String,
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
      },
      logo: String
    },
    customerSnapshot: {
      name: String,
      companyName: String,
      email: String,
      phone: String,
      gstin: String,
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
      }
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    dueDate: {
      type: Date,
      required: true,
      index: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    paidAt: {
      type: Date,
      default: null
    },
    items: {
      type: [InvoiceItemSchema],
      default: []
    },
    subtotal: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxableAmount: {
      type: Number,
      default: 0
    },
    isInterState: {
      type: Boolean,
      default: false
    },
    cgstTotal: {
      type: Number,
      default: 0
    },
    sgstTotal: {
      type: Number,
      default: 0
    },
    igstTotal: {
      type: Number,
      default: 0
    },
    totalTaxAmount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    shippingCharges: {
      type: Number,
      default: 0
    },
    otherCharges: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      default: function (this: IInvoiceDocument) {
        return this.grandTotal;
      }
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    balanceDue: {
      type: Number,
      default: function (this: IInvoiceDocument) {
        return Math.max(0, this.grandTotal - (this.amountPaid || 0));
      }
    },
    status: {
      type: String,
      default: 'ISSUED',
      index: true
    },
    paymentTerms: {
      type: String,
      default: 'NET_30'
    },
    notes: {
      type: String,
      trim: true
    },
    termsAndConditions: {
      type: String,
      trim: true
    },
    finalizedAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound Unique Index: Invoice number unique per business
InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ businessId: 1, invoiceDate: -1 });
InvoiceSchema.index({ businessId: 1, status: 1 });

export const Invoice: Model<IInvoiceDocument> =
  mongoose.models.Invoice || mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema);

export default Invoice;
