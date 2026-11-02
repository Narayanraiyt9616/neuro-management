import { z } from 'zod';

export const branchCreateSchema = z.object({
  code: z
    .string()
    .min(2, 'Branch code must be at least 2 characters')
    .max(20, 'Branch code cannot exceed 20 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Branch code must be alphanumeric with hyphens or underscores'),
  name: z.string().min(2, 'Branch name must be at least 2 characters').max(100, 'Branch name cannot exceed 100 characters'),
  type: z.enum(['HEADQUARTERS', 'RETAIL_STORE', 'WAREHOUSE_DEPOT', 'REGIONAL_OFFICE']).default('RETAIL_STORE'),
  managerId: z.string().nullable().optional(),
  address: z
    .object({
      street: z.string().optional().default(''),
      city: z.string().optional().default(''),
      state: z.string().optional().default(''),
      postalCode: z.string().optional().default(''),
      country: z.string().optional().default('India')
    })
    .optional(),
  contactPhone: z.string().optional().default(''),
  contactEmail: z.string().email('Invalid contact email format').or(z.literal('')).optional(),
  taxNumber: z.string().optional().default(''),
  isMainBranch: z.boolean().optional().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  operatingHours: z
    .object({
      openTime: z.string().default('09:00'),
      closeTime: z.string().default('18:00'),
      workingDays: z.array(z.string()).default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    })
    .optional(),
  currency: z.string().default('USD')
});

export const branchUpdateSchema = branchCreateSchema.partial();

export const branchTransferSchema = z.object({
  fromBranchId: z.string().min(1, 'Origin branch ID is required'),
  toBranchId: z.string().min(1, 'Destination branch ID is required'),
  fromWarehouseId: z.string().min(1, 'Origin warehouse ID is required'),
  toWarehouseId: z.string().min(1, 'Destination warehouse ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Transfer quantity must be greater than zero'),
  notes: z.string().optional()
});

export type BranchCreateInput = z.infer<typeof branchCreateSchema>;
export type BranchUpdateInput = z.infer<typeof branchUpdateSchema>;
export type BranchTransferInput = z.infer<typeof branchTransferSchema>;

