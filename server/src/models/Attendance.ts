import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';

export interface IAttendanceDocument extends Document {
  businessId: Types.ObjectId;
  employeeId: Types.ObjectId;
  userId?: Types.ObjectId;
  date: Date;
  checkIn?: Date | null;
  checkOut?: Date | null;
  workingHours: number;
  status: AttendanceStatus;
  lateMinutes: number;
  ipAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true
    },
    checkIn: {
      type: Date,
      default: null
    },
    checkOut: {
      type: Date,
      default: null
    },
    workingHours: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'],
      default: 'PRESENT',
      index: true
    },
    lateMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    ipAddress: {
      type: String
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

AttendanceSchema.index({ businessId: 1, employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ businessId: 1, date: -1 });

export const Attendance: Model<IAttendanceDocument> =
  mongoose.models.Attendance || mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);

export default Attendance;

