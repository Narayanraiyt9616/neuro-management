import { z } from 'zod';

export const clientBusinessRegistrationSchema = z.object({
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
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('US'),
  category: z
    .string()
    .trim()
    .min(2, 'Business category is required'),
  registrationNumber: z
    .string()
    .trim()
    .min(3, 'Corporate registration number is required'),
  gstin: z.string().trim().optional(),
  website: z.string().trim().optional(),
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
  planCode: z
    .enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
    .default('STARTER')
});

export type ClientBusinessRegistrationForm = z.infer<typeof clientBusinessRegistrationSchema>;

export const clientSubscriptionPlanSchema = z.object({
  name: z.string().trim().min(2, 'Plan name must be at least 2 characters'),
  description: z.string().trim().min(5, 'Plan description is required'),
  monthlyPrice: z.number().min(0, 'Monthly price must be non-negative'),
  yearlyPrice: z.number().min(0, 'Yearly price must be non-negative'),
  employeeLimit: z.number().min(1, 'Employee limit must be at least 1'),
  storageLimitGb: z.number().min(1, 'Storage limit must be at least 1 GB')
});

export type ClientSubscriptionPlanForm = z.infer<typeof clientSubscriptionPlanSchema>;

