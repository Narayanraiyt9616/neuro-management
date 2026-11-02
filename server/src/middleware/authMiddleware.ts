import { Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { IAuthRequest, UserRole } from '../types';
import tokenService from '../services/tokenService';
import resilientAuthStore from '../services/resilientAuthStore';
import ApiResponse from '../utils/apiResponse';
import logger from '../utils/logger';

/**
 * Login & Auth Rate Limiting Middleware
 * Throttles excessive brute-force attempts on sensitive authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    timestamp: new Date().toISOString()
  }
});

/**
 * Authentication Middleware
 * Validates JWT access token and attaches verified user identity
 */
export const authenticateToken = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.error(res, 'Authentication token missing. Please sign in.', 401);
    }

    let decoded;
    try {
      decoded = tokenService.verifyJwt(token);
    } catch {
      return ApiResponse.error(res, 'Session token expired or invalid. Please sign in again.', 401);
    }

    // Never trust frontend data alone - verify against database
    const dbUser = await resilientAuthStore.findUserById(decoded.userId);
    if (!dbUser) {
      return ApiResponse.error(res, 'User record associated with this token no longer exists.', 401);
    }

    if (dbUser.status !== 'active') {
      logger.warn(`Rejected login session for inactive/suspended account: ${dbUser.email} (Status: ${dbUser.status})`);
      return ApiResponse.error(
        res,
        `Your account is currently ${dbUser.status}. Please contact platform administrators.`,
        403
      );
    }

    // Attach verified user identity from DB (never from client request params)
    req.user = {
      userId: dbUser._id.toString(),
      email: dbUser.email,
      role: dbUser.role,
      businessId: dbUser.businessId ? dbUser.businessId.toString() : null
    };
    req.dbUser = dbUser;

    next();
  } catch (error) {
    logger.error('Error verifying authentication token', error);
    return ApiResponse.error(res, 'Failed to authenticate request.', 500);
  }
};

/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 * Verifies that the authenticated user possesses one of the permitted roles
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated request. Access denied.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `RBAC Violation: User ${req.user.email} (${req.user.role}) attempted to access restricted endpoint requiring [${allowedRoles.join(
          ', '
        )}]`
      );
      return ApiResponse.error(
        res,
        `Access denied. Your role '${req.user.role}' lacks permission to perform this operation.`,
        403
      );
    }

    next();
  };
};

/**
 * Business Multi-Tenant Isolation Middleware
 * Enforces strict tenant boundaries:
 * 1. SUPER_ADMIN has platform-wide bypass.
 * 2. All other roles can strictly access only resources belonging to their own businessId.
 */
export const authorizeBusiness = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required for business operations.', 401);
  }

  // Super Admin can inspect across all business partitions
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const requestedBusinessId =
    req.params.businessId ||
    req.body.businessId ||
    (req.query.businessId as string) ||
    req.headers['x-business-id'];

  // If a specific business is requested, it MUST match the user's bound businessId
  if (requestedBusinessId && requestedBusinessId !== req.user.businessId) {
    logger.warn(
      `Tenant Isolation Breach Attempt: User ${req.user.email} from business ${req.user.businessId} requested access to ${requestedBusinessId}`
    );
    return ApiResponse.error(
      res,
      'Access denied: You are not authorized to view or modify records belonging to another business.',
      403
    );
  }

  // Ensure non-superadmin users have an associated business
  if (!req.user.businessId) {
    return ApiResponse.error(
      res,
      'No active business association found for this user account.',
      403
    );
  }

  next();
};

export default {
  authRateLimiter,
  authenticateToken,
  authorizeRoles,
  authorizeBusiness
};
