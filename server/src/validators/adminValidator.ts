import { z } from 'zod';

export const subscriptionPlanSchema = z.object({
  name: z.string().trim().min(2, 'Plan name must be at least 2 characters'),
  code: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  description: z.string().trim().min(5, 'Plan description is required'),
  monthlyPrice: z.number().min(0, 'Monthly price must be non-negative'),
  yearlyPrice: z.number().min(0, 'Yearly price must be non-negative'),
  employeeLimit: z.number().min(1, 'Employee limit must be at least 1'),
  storageLimitGb: z.number().min(1, 'Storage limit must be at least 1 GB'),
  moduleAccess: z.array(z.string()).min(1, 'At least one module must be granted'),
  features: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true)
});

export type SubscriptionPlanInput = z.infer<typeof subscriptionPlanSchema>;

export const userStatusUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended'])
});

export type UserStatusUpdateInput = z.infer<typeof userStatusUpdateSchema>;

export const platformSettingsSchema = z.object({
  platformName: z.string().trim().min(2).optional(),
  logo: z.string().nullable().optional(),
  general: z.object({
    supportEmail: z.string().email(),
    contactPhone: z.string(),
    defaultTimezone: z.string(),
    maintenanceMode: z.boolean()
  }).optional(),
  email: z.object({
    smtpHost: z.string(),
    smtpPort: z.number(),
    smtpUser: z.string(),
    smtpFrom: z.string(),
    secure: z.boolean()
  }).optional(),
  security: z.object({
    sessionTimeoutMinutes: z.number(),
    maxLoginAttempts: z.number(),
    lockDurationMinutes: z.number(),
    requireMfa: z.boolean()
  }).optional(),
  subscription: z.object({
    freeTrialDays: z.number(),
    defaultCurrency: z.string(),
    taxPercentage: z.number(),
    invoicePrefix: z.string()
  }).optional()
});

export type PlatformSettingsInput = z.infer<typeof platformSettingsSchema>;

export const paymentIntentSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  planCode: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  billingCycle: z.enum(['monthly', 'annual']),
  provider: z.enum(['stripe', 'razorpay'])
});

export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;

