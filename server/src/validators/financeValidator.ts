import { z } from 'zod';

export const incomeSchema = z.object({
  title: z.string().trim().min(2, 'Income title is required'),
  category: z.string().trim().min(2, 'Category is required'),
  source: z.string().trim().min(2, 'Source is required'),
  amount: z.number().positive('Amount must be a positive number'),
  taxDeducted: z.number().nonnegative('Tax deducted must be 0 or positive').optional().default(0),
  date: z.string().or(z.date()).optional(),
  paymentMethod: z.enum([
    'BANK_TRANSFER',
    'UPI',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CASH',
    'CHEQUE',
    'OTHER'
  ]).default('BANK_TRANSFER'),
  referenceNumber: z.string().trim().optional().default(''),
  customerId: z.string().optional().or(z.literal('')),
  invoiceId: z.string().optional().or(z.literal('')),
  notes: z.string().trim().optional().default('')
});

export const incomeUpdateSchema = incomeSchema.partial().extend({
  status: z.enum(['RECORDED', 'VOID']).optional()
});

export const expenseCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required'),
  code: z.string().trim().min(2, 'Category code is required').toUpperCase(),
  description: z.string().trim().optional().default(''),
  isTaxDeductible: z.boolean().optional().default(true),
  budgetLimit: z.number().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true)
});

export const expenseCategoryUpdateSchema = expenseCategorySchema.partial();

export const expenseSchema = z.object({
  title: z.string().trim().min(2, 'Expense title is required'),
  categoryId: z.string().optional().or(z.literal('')),
  category: z.string().trim().min(2, 'Category is required'),
  amount: z.number().positive('Expense amount must be positive'),
  taxAmount: z.number().nonnegative().optional().default(0),
  date: z.string().or(z.date()).optional(),
  vendor: z.string().trim().optional().default(''),
  vendorGstin: z.string().trim().optional().default(''),
  paymentMethod: z.string().trim().optional().default('BANK_TRANSFER'),
  reference: z.string().trim().optional().default(''),
  receiptUrl: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default('')
});

export const expenseUpdateSchema = expenseSchema.partial().extend({
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  rejectionReason: z.string().trim().optional()
});

export const invoiceItemSchema = z.object({
  productId: z.string().optional().or(z.literal('')),
  name: z.string().trim().min(1, 'Item name is required'),
  description: z.string().trim().optional().default(''),
  hsnSacCode: z.string().trim().optional().default(''),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().trim().optional().default('units'),
  unitPrice: z.number().nonnegative('Unit price must be 0 or positive'),
  discount: z.number().nonnegative('Discount must be 0 or positive').optional().default(0),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional().default(0)
});

export const invoiceCreateSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  salesOrderId: z.string().optional().or(z.literal('')),
  invoiceDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
  shippingCharges: z.number().nonnegative().optional().default(0),
  otherCharges: z.number().nonnegative().optional().default(0),
  paymentTerms: z.string().trim().optional().default('NET_30'),
  notes: z.string().trim().optional().default(''),
  termsAndConditions: z.string().trim().optional().default('Standard terms apply.')
});

export const invoiceUpdateSchema = z.object({
  dueDate: z.string().or(z.date()).optional(),
  notes: z.string().trim().optional(),
  termsAndConditions: z.string().trim().optional(),
  status: z.enum(['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']).optional()
});

export const paymentCreateSchema = z.object({
  invoiceId: z.string().optional().or(z.literal('')),
  customerId: z.string().optional().or(z.literal('')),
  amount: z.number().positive('Payment amount must be greater than 0'),
  paymentDate: z.string().or(z.date()).optional(),
  paymentMethod: z.enum([
    'BANK_TRANSFER',
    'UPI',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CASH',
    'CHEQUE',
    'OTHER'
  ]).default('BANK_TRANSFER'),
  referenceNumber: z.string().trim().min(2, 'Payment reference/UTR number is required for verification'),
  notes: z.string().trim().optional().default('')
});

export const refundCreateSchema = z.object({
  paymentId: z.string().optional().or(z.literal('')),
  invoiceId: z.string().optional().or(z.literal('')),
  customerId: z.string().optional().or(z.literal('')),
  amount: z.number().positive('Refund amount must be greater than 0'),
  refundDate: z.string().or(z.date()).optional(),
  reason: z.string().trim().min(2, 'Refund reason is required'),
  refundMethod: z.string().trim().optional().default('BANK_TRANSFER'),
  referenceNumber: z.string().trim().min(2, 'Refund reference/UTR number is required'),
  notes: z.string().trim().optional().default('')
});

