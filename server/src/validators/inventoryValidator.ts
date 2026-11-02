import { z } from 'zod';

export const productCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  code: z.string().trim().min(2, 'Category code must be at least 2 characters').toUpperCase(),
  description: z.string().trim().optional().default(''),
  parentCategoryId: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true)
});

export const productCategoryUpdateSchema = productCategorySchema.partial();

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required'),
  sku: z.string().trim().min(2, 'SKU code is required').toUpperCase(),
  barcode: z.string().trim().optional().default(''),
  category: z.string().trim().optional().default('General'),
  categoryId: z.string().optional().or(z.literal('')),
  price: z.number().nonnegative('Selling price must be 0 or positive'),
  cost: z.number().nonnegative('Cost/Purchase price must be 0 or positive').optional().default(0),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional().default(0),
  stockQuantity: z.number().int().nonnegative('Stock quantity must be non-negative integer').optional().default(0),
  initialStock: z.number().int().nonnegative('Initial stock must be non-negative integer').optional(),
  warehouseId: z.string().optional(),
  reorderPoint: z.number().int().nonnegative().optional().default(10),
  minStockThreshold: z.number().int().nonnegative().optional().default(10),
  unit: z.string().trim().optional().default('units'),
  description: z.string().trim().optional().default(''),
  productImage: z.string().trim().optional().default(''),
  supplierId: z.string().optional().or(z.literal('')),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional().default('in_stock')
});

export const productUpdateSchema = productSchema.partial();

export const warehouseSchema = z.object({
  code: z.string().trim().min(2, 'Warehouse code is required').toUpperCase(),
  name: z.string().trim().min(2, 'Warehouse name is required'),
  address: z
    .object({
      street: z.string().optional().default(''),
      city: z.string().optional().default(''),
      state: z.string().optional().default(''),
      postalCode: z.string().optional().default(''),
      country: z.string().optional().default('India')
    })
    .optional(),
  contactPhone: z.string().trim().optional().default(''),
  contactEmail: z.string().trim().optional().default(''),
  managerId: z.string().optional().or(z.literal('')),
  isPrimary: z.boolean().optional().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE')
});

export const warehouseUpdateSchema = warehouseSchema.partial();

export const stockMovementSchema = z.object({
  productId: z.string().min(1, 'Product selection is required'),
  warehouseId: z.string().optional().or(z.literal('')),
  movementType: z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT']),
  quantity: z.number().int().positive('Movement quantity must be a positive integer'),
  reason: z.string().trim().optional().default('Manual Stock Update'),
  referenceType: z.enum(['MANUAL_ADJUSTMENT', 'INITIAL_STOCK']).optional().default('MANUAL_ADJUSTMENT'),
  referenceId: z.string().optional().default('')
});

export const stockTransferSchema = z.object({
  fromWarehouseId: z.string().min(1, 'Source warehouse is required'),
  toWarehouseId: z.string().min(1, 'Destination warehouse is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product is required'),
        quantity: z.number().int().positive('Quantity must be greater than 0')
      })
    )
    .min(1, 'Transfer must contain at least one item'),
  notes: z.string().trim().optional().default('')
});
