import { z } from 'zod';

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid work email address'),
    phone: z
      .string()
      .trim()
      .min(7, 'Phone number must be at least 7 digits')
      .max(20, 'Phone number cannot exceed 20 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Must include at least one lowercase letter (a-z)')
      .regex(/[0-9]/, 'Must include at least one number (0-9)'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    businessName: z
      .string()
      .trim()
      .min(2, 'Organization name must be at least 2 characters')
      .optional()
      .or(z.literal('')),
    role: z
      .enum(['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE', 'CUSTOMER'])
      .optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Must include at least one lowercase letter (a-z)')
      .regex(/[0-9]/, 'Must include at least one number (0-9)'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your new password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Must include at least one lowercase letter (a-z)')
      .regex(/[0-9]/, 'Must include at least one number (0-9)'),
    confirmNewPassword: z
      .string()
      .min(1, 'Please confirm your new password')
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword']
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;

