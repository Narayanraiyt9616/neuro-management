import { z } from 'zod';

export const customerInputSchema = z.object({
  fullName: z.string().trim().min(2, 'Customer full name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Please provide a valid customer email address'),
  phone: z.string().trim().optional().default(''),
  companyName: z.string().trim().optional().default(''),
  gstin: z.string().trim().optional().default(''),
  address: z
    .object({
      street: z.string().optional().default(''),
      city: z.string().optional().default(''),
      state: z.string().optional().default(''),
      postalCode: z.string().optional().default(''),
      country: z.string().optional().default('India')
    })
    .optional(),
  customerType: z
    .enum(['INDIVIDUAL', 'BUSINESS', 'ENTERPRISE', 'RETAIL', 'WHOLESALE'])
    .optional()
    .default('BUSINESS'),
  status: z
    .enum(['ACTIVE', 'INACTIVE', 'LEAD', 'BLOCKED', 'active', 'inactive'])
    .optional()
    .default('ACTIVE'),
  notes: z.string().trim().optional().default(''),
  assignedEmployeeId: z.string().optional().or(z.literal(''))
});

export const customerUpdateSchema = customerInputSchema.partial();

export const leadInputSchema = z.object({
  leadName: z.string().trim().min(2, 'Lead name is required and must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Please provide a valid lead email'),
  phone: z.string().trim().optional().default(''),
  company: z.string().trim().optional().default(''),
  source: z
    .enum(['Website', 'Social Media', 'Referral', 'Advertisement', 'Direct Contact', 'Other'])
    .default('Website'),
  assignedEmployeeId: z.string().optional().or(z.literal('')),
  assignedEmployeeName: z.string().optional().default(''),
  leadValue: z.number().nonnegative('Lead value cannot be negative').optional().default(0),
  expectedClosingDate: z.string().optional().or(z.literal('')),
  notes: z.string().trim().optional().default(''),
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'])
    .optional()
    .default('NEW')
});

export const leadUpdateSchema = leadInputSchema.partial();

export const leadConvertSchema = z.object({
  customerType: z
    .enum(['INDIVIDUAL', 'BUSINESS', 'ENTERPRISE', 'RETAIL', 'WHOLESALE'])
    .optional()
    .default('BUSINESS'),
  createOrder: z.boolean().optional().default(false),
  orderNotes: z.string().optional().default(''),
  orderItems: z
    .array(
      z.object({
        productId: z.string().optional(),
        productName: z.string().min(1, 'Product name is required'),
        quantity: z.number().positive('Quantity must be at least 1'),
        unitPrice: z.number().nonnegative('Unit price must be positive'),
        discount: z.number().nonnegative().optional().default(0),
        tax: z.number().nonnegative().optional().default(0)
      })
    )
    .optional()
});

export const followUpInputSchema = z.object({
  leadId: z.string().optional().or(z.literal('')),
  customerId: z.string().optional().or(z.literal('')),
  title: z.string().trim().min(2, 'Follow-up title is required'),
  type: z.enum(['CALL', 'MEETING', 'EMAIL', 'DEMO', 'FOLLOW_UP']).default('FOLLOW_UP'),
  scheduledDate: z.string().min(4, 'Valid scheduled date & time is required'),
  nextFollowUpDate: z.string().optional().or(z.literal('')),
  notes: z.string().trim().optional().default(''),
  assignedEmployeeId: z.string().optional().or(z.literal(''))
});

export const followUpUpdateSchema = followUpInputSchema.partial().extend({
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
  outcomeNotes: z.string().optional()
});

export const communicationInputSchema = z.object({
  customerId: z.string().optional().or(z.literal('')),
  leadId: z.string().optional().or(z.literal('')),
  type: z.enum(['EMAIL', 'CALL', 'MEETING', 'NOTE']),
  subject: z.string().trim().min(2, 'Subject is required'),
  body: z.string().trim().min(3, 'Body / message notes are required')
});

