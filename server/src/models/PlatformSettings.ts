import mongoose, { Schema, Model } from 'mongoose';
import { IPlatformSettingsDocument } from '../types';

const PlatformSettingsSchema = new Schema<IPlatformSettingsDocument>({
  platformName: {
    type: String,
    required: true,
    default: 'BizNexus Enterprise'
  },
  logo: {
    type: String,
    default: null
  },
  general: {
    supportEmail: { type: String, default: 'support@biznexus.com' },
    contactPhone: { type: String, default: '+1 (800) 555-BIZN' },
    defaultTimezone: { type: String, default: 'UTC' },
    maintenanceMode: { type: Boolean, default: false }
  },
  email: {
    smtpHost: { type: String, default: 'smtp.biznexus.com' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: 'notifications@biznexus.com' },
    smtpFrom: { type: String, default: 'BizNexus Cloud <notifications@biznexus.com>' },
    secure: { type: Boolean, default: true }
  },
  security: {
    sessionTimeoutMinutes: { type: Number, default: 60 },
    maxLoginAttempts: { type: Number, default: 5 },
    lockDurationMinutes: { type: Number, default: 15 },
    requireMfa: { type: Boolean, default: false }
  },
  subscription: {
    freeTrialDays: { type: Number, default: 14 },
    defaultCurrency: { type: String, default: 'USD' },
    taxPercentage: { type: Number, default: 18 },
    invoicePrefix: { type: String, default: 'BNX-' }
  }
}, {
  timestamps: true
});

export const PlatformSettings: Model<IPlatformSettingsDocument> =
  mongoose.model<IPlatformSettingsDocument>('PlatformSettings', PlatformSettingsSchema);

export default PlatformSettings;

