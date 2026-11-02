import { z } from 'zod';

export const openPosSessionSchema = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  registerName: z.string().min(1, 'Register name is required').default('Register 1'),
  openingBalance: z.number().min(0, 'Opening balance cannot be negative'),
  notes: z.string().optional()
});

export const closePosSessionSchema = z.object({
  closingBalance: z.number().min(0, 'Closing balance cannot be negative'),
  notes: z.string().optional()
});

export const cashAdjustmentSchema = z.object({
  type: z.enum(['CASH_IN', 'CASH_OUT']),
  amount: z.number().positive('Adjustment amount must be positive'),
  reason: z.string().min(2, 'Reason for cash adjustment is required')
});

export const posCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
  taxRate: z.number().min(0).optional().default(0),
  taxAmount: z.number().min(0).optional().default(0),
  subtotal: z.number().min(0),
  total: z.number().min(0)
});

export const posCheckoutSchema = z.object({
  sessionId: z.string().min(1, 'POS Session ID is required'),
  branchId: z.string().optional(),
  warehouseId: z.string().optional(),
  customerId: z.string().nullable().optional(),
  customerName: z.string().optional().default('Walk-in Customer'),
  customerPhone: z.string().optional().default(''),
  customerEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
  items: z.array(posCartItemSchema).min(1, 'Checkout cart must contain at least 1 item'),
  subtotal: z.number().min(0),
  taxTotal: z.number().min(0),
  discountTotal: z.number().min(0),
  grandTotal: z.number().min(0),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'CREDIT', 'SPLIT']),
  amountTendered: z.number().min(0),
  changeDue: z.number().min(0).default(0),
  splitPayments: z
    .array(
      z.object({
        method: z.enum(['CASH', 'CARD', 'UPI', 'CREDIT']),
        amount: z.number().positive(),
        reference: z.string().optional()
      })
    )
    .optional(),
  notes: z.string().optional()
});

export type OpenPosSessionInput = z.infer<typeof openPosSessionSchema>;
export type ClosePosSessionInput = z.infer<typeof closePosSessionSchema>;
export type CashAdjustmentInput = z.infer<typeof cashAdjustmentSchema>;
export type PosCheckoutInput = z.infer<typeof posCheckoutSchema>;

