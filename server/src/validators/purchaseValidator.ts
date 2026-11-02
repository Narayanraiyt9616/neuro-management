import { z } from 'zod';

export const supplierSchema = z.object({
  supplierName: z.string().trim().min(2, 'Supplier name must be at least 2 characters'),
  companyName: z.string().trim().min(2, 'Company name is required'),
  email: z.string().trim().toLowerCase().email('Valid supplier email is required'),
  phone: z.string().trim().min(5, 'Valid contact phone number is required'),
  address: z
    .object({
      street: z.string().optional().default(''),
      city: z.string().optional().default(''),
      state: z.string().optional().default(''),
      postalCode: z.string().optional().default(''),
      country: z.string().optional().default('India')
    })
    .optional(),
  gstin: z.string().trim().optional().default(''),
  contactPerson: z.string().trim().optional().default(''),
  paymentTerms: z.string().trim().optional().default('Net 30'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional().default('ACTIVE')
});

export const supplierUpdateSchema = supplierSchema.partial();

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product selection is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  unitPrice: z.number().nonnegative('Unit purchase price must be 0 or positive'),
  taxRate: z.number().min(0).max(100).optional().default(0)
});

export const purchaseOrderCreateSchema = z.object({
  supplierId: z.string().min(1, 'Supplier selection is required'),
  warehouseId: z.string().optional().or(z.literal('')),
  expectedDeliveryDate: z.string().optional().or(z.literal('')),
  items: z.array(purchaseOrderItemSchema).min(1, 'Purchase order must have at least one line item'),
  shippingCost: z.number().nonnegative().optional().default(0),
  notes: z.string().trim().optional().default('')
});

export const purchaseOrderReceiveSchema = z.object({
  receivedItems: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantityReceived: z.number().int().positive('Quantity received must be at least 1')
      })
    )
    .min(1, 'Must receive at least one item quantity'),
  notes: z.string().trim().optional().default('Goods receipt acknowledged'),
  idempotencyKey: z.string().optional().or(z.literal(''))
});

