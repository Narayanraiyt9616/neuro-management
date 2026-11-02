import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import ApiResponse from '../utils/apiResponse';
import logger from '../utils/logger';
import tokenService from '../services/tokenService';
import emailService from '../services/emailService';
import resilientAuthStore from '../services/resilientAuthStore';
import config from '../config/environment';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validators/authValidator';
import {
  IAuthRequest,
  IAuthResponse,
  IAuthUserDTO,
  UserRole,
  IRegisterInput,
  ILoginInput,
  IForgotPasswordInput,
  IResetPasswordInput,
  IUpdateProfileInput,
  IChangePasswordInput
} from '../types';

/**
 * Helper to construct sanitized user DTO
 */
const buildUserDTO = (user: any, business?: any): IAuthUserDTO => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    avatar: user.avatar || null,
    status: user.status,
    businessId: user.businessId ? user.businessId.toString() : null,
    business: business
      ? {
          id: business._id.toString(),
          name: business.name,
          slug: business.slug,
          industry: business.industry,
          currency: business.currency
        }
      : null
  };
};

/**
 * Handle User Registration
 */
export const register = async (
  req: Request<unknown, unknown, IRegisterInput>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, phone, password, role, businessName } = validatedData;

    // Check if email already registered
    const existingUser = await resilientAuthStore.findUserByEmail(email);
    if (existingUser) {
      return ApiResponse.error(
        res,
        'An account with this email address already exists.',
        409
      );
    }

    const assignedRole: UserRole = role || 'BUSINESS_OWNER';
    let linkedBusinessId: string | null = null;
    let linkedBusiness: any = null;

    // If business owner registers with business name, initialize tenant organization
    if (assignedRole === 'BUSINESS_OWNER' && businessName) {
      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      linkedBusiness = await resilientAuthStore.createBusiness({
        name: businessName,
        slug: `${slug}-${Date.now().toString(36)}`,
        ownerId: 'pending',
        industry: 'Enterprise Software & Services',
        currency: 'USD'
      });
      linkedBusinessId = linkedBusiness._id.toString();
    }

    // Create user entity
    const user = await resilientAuthStore.createUser({
      name,
      email,
      phone,
      password,
      role: assignedRole,
      businessId: linkedBusinessId
    });

    // Generate JWT token
    const token = tokenService.generateJwt({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      businessId: user.businessId ? user.businessId.toString() : null
    });

    // Send async welcome email
    emailService.sendWelcomeEmail(user.email, user.name, user.role).catch((err) => {
      logger.error('Failed to dispatch welcome email', err);
    });

    logger.info(`User registered successfully: ${user.email} (Role: ${user.role})`);

    const authResponse: IAuthResponse = {
      user: buildUserDTO(user, linkedBusiness),
      token
    };

    return ApiResponse.created<IAuthResponse>(
      res,
      authResponse,
      'Registration successful. Welcome to BizNexus.'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error in submitted registration details.', 400, error.issues);
    }
    next(error);
  }
};

/**
 * Handle User Login
 */
export const login = async (
  req: Request<unknown, unknown, ILoginInput>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user by email
    const user = await resilientAuthStore.findUserByEmail(email);
    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password.', 401);
    }

    // Verify password using bcrypt
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return ApiResponse.error(res, 'Invalid email or password.', 401);
    }

    // Verify account status
    if (user.status !== 'active') {
      logger.warn(`Rejected login for suspended/inactive account: ${user.email} (Status: ${user.status})`);
      return ApiResponse.error(
        res,
        `Your account is currently ${user.status}. Please contact platform administrators.`,
        403
      );
    }

    // Update last login timestamp
    await resilientAuthStore.updateUser(user._id.toString(), {
      lastLoginAt: new Date()
    });

    // Fetch linked business if associated
    let linkedBusiness = null;
    if (user.businessId) {
      linkedBusiness = await resilientAuthStore.findBusinessById(user.businessId.toString());
    }

    // Generate JWT token
    const token = tokenService.generateJwt({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      businessId: user.businessId ? user.businessId.toString() : null
    });

    logger.info(`User authenticated: ${user.email} (Role: ${user.role})`);

    const authResponse: IAuthResponse = {
      user: buildUserDTO(user, linkedBusiness),
      token
    };

    return ApiResponse.success<IAuthResponse>(
      res,
      authResponse,
      'Authentication successful.'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error in submitted login credentials.', 400, error.issues);
    }
    next(error);
  }
};

/**
 * Handle User Logout
 */
export const logout = async (req: IAuthRequest, res: Response): Promise<Response> => {
  if (req.user) {
    logger.info(`User signed out: ${req.user.email}`);
  }
  return ApiResponse.success(res, null, 'Signed out successfully.');
};

/**
 * Handle Forgot Password Request
 */
export const forgotPassword = async (
  req: Request<unknown, unknown, IForgotPasswordInput>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { email } = validatedData;

    const user = await resilientAuthStore.findUserByEmail(email);

    // If user does not exist, return generic success to prevent email enumeration
    if (!user) {
      return ApiResponse.success(
        res,
        { email },
        'If an account exists with this email, a password reset link has been dispatched.'
      );
    }

    if (user.status !== 'active') {
      return ApiResponse.error(
        res,
        `Cannot reset password: this account is currently ${user.status}.`,
        403
      );
    }

    // Generate secure random reset token
    const resetToken = tokenService.generateResetToken();
    const expiresAt = new Date(Date.now() + config.resetTokenExpiresMinutes * 60 * 1000);

    // Save token record
    await resilientAuthStore.createResetToken(user._id.toString(), resetToken, expiresAt);

    // Dispatch email notification
    const emailResult = await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);

    logger.info(`Password reset token dispatched for user: ${user.email}`);

    return ApiResponse.success(
      res,
      {
        email: user.email,
        expiresInMinutes: config.resetTokenExpiresMinutes,
        // In development/test mode, expose resetToken & previewUrl for immediate testing
        previewToken: config.isDevelopment ? resetToken : undefined,
        previewUrl: config.isDevelopment ? emailResult.previewUrl : undefined
      },
      'Password reset instructions have been sent to your email.'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error in email format.', 400, error.issues);
    }
    next(error);
  }
};

/**
 * Verify validity of a password reset token before showing reset form
 */
export const verifyResetToken = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { token } = req.params;

    if (!token || token.trim().length === 0) {
      return ApiResponse.error(res, 'Reset token is required.', 400);
    }

    const tokenDoc = await resilientAuthStore.findResetToken(token);

    if (!tokenDoc) {
      return ApiResponse.error(
        res,
        'Invalid or expired password reset token. Please request a new link.',
        400
      );
    }

    return ApiResponse.success(
      res,
      { valid: true, expiresAt: tokenDoc.expiresAt },
      'Reset token is valid.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password using verified token
 */
export const resetPassword = async (
  req: Request<unknown, unknown, IResetPasswordInput>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const { token, password } = validatedData;

    const tokenDoc = await resilientAuthStore.findResetToken(token);
    if (!tokenDoc) {
      return ApiResponse.error(
        res,
        'Invalid or expired password reset token. Please request a new link.',
        400
      );
    }

    // Update user password
    const updatedUser = await resilientAuthStore.updateUser(tokenDoc.userId.toString(), {
      password
    });

    if (!updatedUser) {
      return ApiResponse.error(res, 'User record not found for this reset token.', 404);
    }

    // Mark token as used
    await resilientAuthStore.markResetTokenUsed(token);

    logger.info(`Password successfully reset for user: ${updatedUser.email}`);

    return ApiResponse.success(
      res,
      { email: updatedUser.email },
      'Password has been reset successfully. You may now sign in with your new password.'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error in submitted password.', 400, error.issues);
    }
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
export const getCurrentUser = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required.', 401);
    }

    const user = await resilientAuthStore.findUserById(req.user.userId);
    if (!user) {
      return ApiResponse.error(res, 'User profile not found.', 404);
    }

    let linkedBusiness = null;
    if (user.businessId) {
      linkedBusiness = await resilientAuthStore.findBusinessById(user.businessId.toString());
    }

    return ApiResponse.success<IAuthUserDTO>(
      res,
      buildUserDTO(user, linkedBusiness),
      'User profile retrieved successfully.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update current authenticated user profile
 */
export const updateProfile = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required.', 401);
    }

    const validatedData = updateProfileSchema.parse(req.body as IUpdateProfileInput);

    const user = await resilientAuthStore.updateUser(req.user.userId, {
      name: validatedData.name,
      phone: validatedData.phone,
      avatar: validatedData.avatar
    });

    if (!user) {
      return ApiResponse.error(res, 'User profile not found.', 404);
    }

    let linkedBusiness = null;
    if (user.businessId) {
      linkedBusiness = await resilientAuthStore.findBusinessById(user.businessId.toString());
    }

    logger.info(`Profile updated for user: ${user.email}`);

    return ApiResponse.success<IAuthUserDTO>(
      res,
      buildUserDTO(user, linkedBusiness),
      'Profile updated successfully.'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error in profile update.', 400, error.issues);
    }
    next(error);
  }
};

/**
 * Change authenticated user password
 */
export const changePassword = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required.', 401);
    }

    const validatedData = changePasswordSchema.parse(req.body as IChangePasswordInput);
    const { currentPassword, newPassword } = validatedData;

    const user = await resilientAuthStore.findUserById(req.user.userId);
    if (!user) {
      return ApiResponse.error(res, 'User account not found.', 404);
    }

    const isCurrentValid = await user.comparePassword(currentPassword);
    if (!isCurrentValid) {
      return ApiResponse.error(res, 'Current password does not match.', 400);
    }

    await resilientAuthStore.updateUser(user._id.toString(), {
      password: newPassword
    });

    logger.info(`Password changed successfully by user: ${user.email}`);

    return ApiResponse.success(res, null, 'Password updated successfully.');
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error in password change.', 400, error.issues);
    }
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getCurrentUser,
  updateProfile,
  changePassword
};
