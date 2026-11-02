import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IEmployeeDocumentItem {
  name: string;
  url: string;
  fileType: string;
  uploadedAt: Date;
}

export interface IEmployeeDocument extends Document {
  businessId: Types.ObjectId;
  userId?: Types.ObjectId;
  employeeId: string;
  fullName: string;
  profilePhoto?: string | null;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  departmentId?: Types.ObjectId;
  departmentName?: string;
  branchId?: Types.ObjectId | null;
  branchName?: string;
  designation: string;
  joiningDate: Date;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  salary: {
    basicSalary: number;
    currency: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
  documents: IEmployeeDocumentItem[];
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeDocumentItemSchema = new Schema<IEmployeeDocumentItem>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const EmployeeSchema = new Schema<IEmployeeDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
      uppercase: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    profilePhoto: {
      type: String,
      default: null
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'US' }
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    departmentName: {
      type: String,
      default: 'General'
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true
    },
    branchName: {
      type: String,
      default: ''
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
      default: 'FULL_TIME'
    },
    salary: {
      basicSalary: {
        type: Number,
        required: true,
        min: 0,
        default: 4500
      },
      currency: {
        type: String,
        default: 'USD',
        uppercase: true
      }
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'],
      default: 'ACTIVE',
      index: true
    },
    documents: [EmployeeDocumentItemSchema]
  },
  {
    timestamps: true
  }
);

EmployeeSchema.index({ businessId: 1, employeeId: 1 }, { unique: true });
EmployeeSchema.index({ businessId: 1, email: 1 });
EmployeeSchema.index({ businessId: 1, status: 1 });

export const Employee: Model<IEmployeeDocument> =
  mongoose.models.Employee || mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema);

export default Employee;

