import { z } from 'zod';

export const createSupportTicketSchema = z.object({
  title: z.string().min(3, 'Subject must be at least 3 characters').max(150, 'Subject is too long'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(2000, 'Description is too long'),
  category: z.enum(['BILLING', 'ORDER', 'TECHNICAL', 'GENERAL']).default('GENERAL'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM')
});

export const addTicketMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
  attachments: z.array(z.string()).optional()
});

export const quoteDecisionSchema = z.object({
  decision: z.enum(['ACCEPT', 'DECLINE']),
  notes: z.string().optional()
});

export const customerPayInvoiceSchema = z.object({
  paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING']),
  amount: z.number().positive('Payment amount must be greater than zero'),
  transactionReference: z.string().optional()
});

export const updateCustomerProfileSchema = z.object({
  name: z.string().min(2, 'Name is required').optional(),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional()
    })
    .optional()
});

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
export type AddTicketMessageInput = z.infer<typeof addTicketMessageSchema>;
export type QuoteDecisionInput = z.infer<typeof quoteDecisionSchema>;
export type CustomerPayInvoiceInput = z.infer<typeof customerPayInvoiceSchema>;
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;

