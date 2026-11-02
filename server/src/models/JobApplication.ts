import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type CandidateStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'REJECTED';

export interface IInterviewSchedule {
  date?: Date;
  time?: string;
  interviewer?: string;
  mode?: 'IN_PERSON' | 'VIRTUAL';
  scheduledDate?: Date;
  interviewerName?: string;
  meetingLink?: string;
  notes?: string;
}


export interface IJobApplicationDocument extends Document {
  businessId: Types.ObjectId;
  jobOpeningId: Types.ObjectId;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl?: string;
  qualifications?: string;
  experienceYears: number;
  status: CandidateStatus;
  interviewSchedule?: IInterviewSchedule;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewScheduleSchema = new Schema<IInterviewSchedule>(
  {
    date: { type: Date, default: null },
    time: { type: String, default: '' },
    interviewer: { type: String, default: '' },
    mode: { type: String, enum: ['IN_PERSON', 'VIRTUAL'], default: 'VIRTUAL' },
    scheduledDate: { type: Date, default: null },
    interviewerName: { type: String, default: '' },
    meetingLink: { type: String, default: '' },
    notes: String
  },
  { _id: false }
);

const JobApplicationSchema = new Schema<IJobApplicationDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business reference is required'],
      index: true
    },
    jobOpeningId: {
      type: Schema.Types.ObjectId,
      ref: 'JobOpening',
      required: [true, 'Job opening reference is required'],
      index: true
    },
    candidateName: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true
    },
    candidateEmail: {
      type: String,
      required: [true, 'Candidate email is required'],
      lowercase: true,
      trim: true
    },
    candidatePhone: {
      type: String,
      trim: true
    },
    resumeUrl: {
      type: String,
      trim: true
    },
    qualifications: {
      type: String,
      trim: true
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'],
      default: 'APPLIED',
      index: true
    },
    interviewSchedule: {
      type: InterviewScheduleSchema,
      default: null
    },
    feedback: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

JobApplicationSchema.index({ businessId: 1, jobOpeningId: 1, status: 1 });

export const JobApplication: Model<IJobApplicationDocument> =
  mongoose.models.JobApplication || mongoose.model<IJobApplicationDocument>('JobApplication', JobApplicationSchema);

export default JobApplication;
