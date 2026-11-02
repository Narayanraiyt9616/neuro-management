import { z } from 'zod';

export const salesOrderItemSchema = z.object({
  productId: z.string().optional().or(z.literal('')),
  productName: z.string().trim().min(1, 'Product name is required'),
  sku: z.string().trim().optional().default(''),
  quantity: z.number().int().positive('Quantity must be an integer greater than 0'),
  unitPrice: z.number().nonnegative('Unit price must be 0 or greater'),
  discount: z.number().nonnegative('Discount cannot be negative').optional().default(0),
  tax: z.number().min(0).max(100, 'Tax percentage must be between 0 and 100').optional().default(0)
});

export const salesOrderCreateSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, 'Sales order must contain at least one line item'),
  taxRate: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  shippingFee: z.number().nonnegative().optional().default(0),
  expectedDeliveryDate: z.string().optional().or(z.literal('')),
  assignedEmployeeId: z.string().optional().or(z.literal('')),
  notes: z.string().trim().optional().default(''),
  status: z
    .enum(['DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .optional()
    .default('CONFIRMED'),
  paymentStatus: z
    .enum(['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'])
    .optional()
    .default('UNPAID')
});

export const salesOrderUpdateSchema = salesOrderCreateSchema.partial();

export const salesOrderStatusSchema = z.object({
  status: z.enum(['DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  reason: z.string().optional()
});

