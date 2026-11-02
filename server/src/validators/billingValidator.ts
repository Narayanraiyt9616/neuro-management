import { z } from 'zod';

export const subscriptionPurchaseSchema = z.object({
  planCode: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  paymentMethod: z.string().optional()
});

export const webhookPayloadSchema = z.object({
  event: z.string().min(1, 'Webhook event is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  orderId: z.string().optional(),
  businessId: z.string().min(1, 'Business ID is required'),
  planCode: z.string().min(1, 'Plan code is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().default('USD'),
  signature: z.string().min(1, 'Webhook cryptographic signature is required'),
  timestamp: z.number().optional()
});

export const notificationPreferenceSchema = z.object({
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  taskAlerts: z.boolean().optional(),
  inventoryAlerts: z.boolean().optional(),
  financialAlerts: z.boolean().optional(),
  marketingUpdates: z.boolean().optional()
});
