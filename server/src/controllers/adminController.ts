import { Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import ApiResponse from '../utils/apiResponse';
import adminService from '../services/adminService';
import { IAuthRequest } from '../types';
import {
  subscriptionPlanSchema,
  userStatusUpdateSchema,
  platformSettingsSchema,
  paymentIntentSchema
} from '../validators/adminValidator';
import {
  businessStatusUpdateSchema,
  businessEditSchema
} from '../validators/businessValidator';

export const getOverviewStats = async (
  _req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const stats = await adminService.getOverviewStats();
    return ApiResponse.success(res, stats, 'Platform overview statistics retrieved.');
  } catch (err) {
    next(err);
  }
};

export const getBusinesses = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { search, status, page, limit } = req.query;
    const result = await adminService.getBusinesses({
      search: search as string,
      status: status as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    return ApiResponse.success(res, result, 'Businesses retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const getBusinessById = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;
    const business = await adminService.getBusinessById(id);
    if (!business) {
      return ApiResponse.error(res, 'Business entity not found.', 404);
    }
    return ApiResponse.success(res, business, 'Business details retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const approveBusiness = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;
    const adminUser = {
      email: req.user?.email || 'admin@biznexus.com',
      userId: req.user?.userId || 'usr_superadmin'
    };
    const business = await adminService.approveBusiness(id, adminUser);
    return ApiResponse.success(res, business, `Business '${business.name}' has been APPROVED and activated.`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('not found')) {
      return ApiResponse.error(res, 'Business not found.', 404);
    }
    next(err);
  }
};

export const rejectBusiness = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;
    const { reason } = businessStatusUpdateSchema.parse({
      status: 'REJECTED',
      reason: req.body.reason || 'Application does not meet platform compliance criteria.'
    });

    const adminUser = {
      email: req.user?.email || 'admin@biznexus.com',
      userId: req.user?.userId || 'usr_superadmin'
    };
    const business = await adminService.rejectBusiness(id, reason || 'Compliance criteria not met', adminUser);
    return ApiResponse.success(res, business, `Business '${business.name}' has been REJECTED.`);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error', 400, err.issues);
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('not found')) {
      return ApiResponse.error(res, 'Business not found.', 404);
    }
    next(err);
  }
};

export const suspendBusiness = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const adminUser = {
      email: req.user?.email || 'admin@biznexus.com',
      userId: req.user?.userId || 'usr_superadmin'
    };
    const business = await adminService.suspendBusiness(id, reason || 'Policy compliance suspension', adminUser);
    return ApiResponse.success(res, business, `Business '${business.name}' has been SUSPENDED.`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('not found')) {
      return ApiResponse.error(res, 'Business not found.', 404);
    }
    next(err);
  }
};

export const reactivateBusiness = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;
    const adminUser = {
      email: req.user?.email || 'admin@biznexus.com',
      userId: req.user?.userId || 'usr_superadmin'
    };
    const business = await adminService.reactivateBusiness(id, adminUser);
    return ApiResponse.success(res, business, `Business '${business.name}' has been REACTIVATED.`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('not found')) {
      return ApiResponse.error(res, 'Business not found.', 404);
    }
    next(err);
  }
};

export const editBusiness = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;
    const validated = businessEditSchema.parse(req.body);
    const adminUser = {
      email: req.user?.email || 'admin@biznexus.com',
      userId: req.user?.userId || 'usr_superadmin'
    };
    const business = await adminService.editBusiness(id, validated, adminUser);
    return ApiResponse.success(res, business, 'Business details updated successfully.');
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error', 400, err.issues);
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('not found')) {
      return ApiResponse.error(res, 'Business not found.', 404);
    }
    next(err);
  }
};

export const getSubscriptionPlans = async (
  _req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const plans = await adminService.getSubscriptionPlans();
    return ApiResponse.success(res, plans, 'Subscription plans retrieved.');
  } catch (err) {
    next(err);
  }
};

export const createSubscriptionPlan = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validated = subscriptionPlanSchema.parse(req.body);
    const adminUser = {
      email: req.user?.email || 'admin@biznexus.com',
      userId: req.user?.userId || 'usr_superadmin'
    };
    const plan = await adminService.createSubscriptionPlan(validated, adminUser);
    return ApiResponse.created(res, plan, 'Subscription plan created successfully.');
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error', 400, err.issues);
    }
    next(err);
  }
};

export const updateSubscriptionPlan = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;
    const validated = subscriptionPlanSchema.partial().parse(req.body);
    const adminUser = {
      email: req.user?.email || 'admin@biznexus.com',
      userId: req.user?.userId || 'usr_superadmin'
    };
    const plan = await adminService.updateSubscriptionPlan(id, validated, adminUser);
    return ApiResponse.success(res, plan, 'Subscription plan updated successfully.');
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error', 400, err.issues);
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('not found')) {
      return ApiResponse.error(res, 'Subscription plan not found.', 404);
    }
    next(err);
  }
};

export const getSubscriptions = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { status, page, limit } = req.query;
    const result = await adminService.getSubscriptions({
      status: status as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    return ApiResponse.success(res, result, 'Subscriptions retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const createPaymentGatewayIntent = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validated = paymentIntentSchema.parse(req.body);
    const intent = await adminService.createPaymentGatewayIntent(validated);
    return ApiResponse.success(res, intent, 'Payment gateway intent initialized.');
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error', 400, err.issues);
    }
    next(err);
  }
};

export const getUsers = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { search, role, businessId, page, limit } = req.query;
    const result = await adminService.getUsers({
      search: search as string,
      role: role as string,
      businessId: businessId as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    return ApiResponse.success(res, result, 'Platform users retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;
    const { status } = userStatusUpdateSchema.parse(req.body);
    const adminUser = {
      email: req.user?.email || 'admin@biznexus.com',
      userId: req.user?.userId || 'usr_superadmin'
    };
    const user = await adminService.updateUserStatus(id, status, adminUser);
    return ApiResponse.success(res, user, `User status updated to '${status}'.`);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error', 400, err.issues);
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('not found')) {
      return ApiResponse.error(res, 'User not found.', 404);
    }
    next(err);
  }
};

export const getAuditLogs = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { module, action, businessId, page, limit } = req.query;
    const result = await adminService.getAuditLogs({
      module: module as string,
      action: action as string,
      businessId: businessId as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    return ApiResponse.success(res, result, 'Audit logs retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const getPlatformSettings = async (
  _req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const settings = await adminService.getPlatformSettings();
    return ApiResponse.success(res, settings, 'Platform settings retrieved.');
  } catch (err) {
    next(err);
  }
};

export const updatePlatformSettings = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validated = platformSettingsSchema.parse(req.body);
    const adminUser = {
      email: req.user?.email || 'admin@biznexus.com',
      userId: req.user?.userId || 'usr_superadmin'
    };
    const settings = await adminService.updatePlatformSettings(validated, adminUser);
    return ApiResponse.success(res, settings, 'Platform settings updated successfully.');
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return ApiResponse.error(res, 'Validation error', 400, err.issues);
    }
    next(err);
  }
};

export default {
  getOverviewStats,
  getBusinesses,
  getBusinessById,
  approveBusiness,
  rejectBusiness,
  suspendBusiness,
  reactivateBusiness,
  editBusiness,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  getSubscriptions,
  createPaymentGatewayIntent,
  getUsers,
  updateUserStatus,
  getAuditLogs,
  getPlatformSettings,
  updatePlatformSettings
};
