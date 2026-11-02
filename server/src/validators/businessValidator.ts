import { z } from 'zod';

export const businessAddressSchema = z.object({
  street: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  postalCode: z.string().optional().default(''),
  country: z.string().optional().default('US')
});

export const businessRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(120, 'Business name cannot exceed 120 characters'),
  logo: z.string().nullable().optional(),
  businessEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid business email address'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number cannot exceed 20 characters'),
  address: businessAddressSchema.optional(),
  category: z
    .string()
    .trim()
    .min(2, 'Business category is required'),
  registrationNumber: z
    .string()
    .trim()
    .min(3, 'Official registration or corporate number is required'),
  gstin: z.string().trim().optional().or(z.literal('')),
  website: z.string().trim().optional().or(z.literal('')),
  description: z
    .string()
    .trim()
    .min(10, 'Please provide a business description of at least 10 characters'),
  ownerName: z
    .string()
    .trim()
    .min(2, 'Owner full name is required'),
  ownerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid owner email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional(),
  planCode: z
    .enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
    .optional()
    .default('STARTER')
});

export type BusinessRegistrationInput = z.infer<typeof businessRegistrationSchema>;

export const businessStatusUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED']),
  reason: z.string().trim().optional()
});

export type BusinessStatusUpdateInput = z.infer<typeof businessStatusUpdateSchema>;

export const businessEditSchema = z.object({
  name: z.string().trim().min(2).optional(),
  category: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(7).optional(),
  businessEmail: z.string().trim().email().optional(),
  website: z.string().trim().optional(),
  description: z.string().trim().optional(),
  address: businessAddressSchema.optional(),
  gstin: z.string().trim().optional(),
  registrationNumber: z.string().trim().optional()
});

export type BusinessEditInput = z.infer<typeof businessEditSchema>;

