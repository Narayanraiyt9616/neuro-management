import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import businessOwnerService from '../services/businessOwnerService';
import ApiResponse from '../utils/apiResponse';

export const businessOwnerController = {
  /**
   * GET /api/business/:businessId/dashboard/stats
   * Returns 10 real database statistics
   */
  async getDashboardStats(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const { period, startDate, endDate } = req.query as {
        period?: string;
        startDate?: string;
        endDate?: string;
      };

      const stats = await businessOwnerService.getDashboardStats(businessId, {
        period,
        startDate,
        endDate
      });

      return ApiResponse.success(res, stats, 'Dashboard statistics fetched successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/business/:businessId/dashboard/analytics
   * Returns data for all 6 interactive charts
   */
  async getAnalytics(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const { period, startDate, endDate } = req.query as {
        period?: string;
        startDate?: string;
        endDate?: string;
      };

      const analytics = await businessOwnerService.getAnalytics(businessId, {
        period,
        startDate,
        endDate
      });

      return ApiResponse.success(res, analytics, 'Business analytics fetched successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/business/:businessId/dashboard/activities
   * Returns real activities from MongoDB ActivityLog
   */
  async getRecentActivities(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const limit = Number(req.query.limit) || 10;

      const activities = await businessOwnerService.getRecentActivities(businessId, limit);
      return ApiResponse.success(res, activities, 'Recent activities fetched successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/business/:businessId/audit-logs
   * Returns paginated audit logs for the specified business
   */
  async getAuditLogs(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const { module, action, page, limit } = req.query;

      const result = await businessOwnerService.getAuditLogs(businessId, {
        module: module as string,
        action: action as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined
      });

      return ApiResponse.success(res, result, 'Business audit logs retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/business/my-businesses
   * Returns all businesses the authenticated user has access to for business switching
   */
  async getMyBusinesses(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Authentication required.', 401);
      }

      const businesses = await businessOwnerService.getOwnerBusinesses(req.user.userId);
      return ApiResponse.success(res, businesses, 'Accessible businesses fetched successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/business/:businessId/profile
   * Allows business owner to update business profile
   */
  async updateBusinessProfile(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const actorUserId = req.user?.userId;

      const updated = await businessOwnerService.updateBusinessProfile(businessId, req.body, actorUserId);
      return ApiResponse.success(res, updated, 'Business profile updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/business/:businessId/settings
   * Allows business owner to update business settings
   */
  async updateBusinessSettings(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const actorUserId = req.user?.userId;

      const updated = await businessOwnerService.updateBusinessSettings(businessId, req.body, actorUserId);
      return ApiResponse.success(res, updated, 'Business operational settings updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  // ==========================================
  // QUICK ACTIONS CONTROLLERS
  // ==========================================

  async quickAddEmployee(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const actorUserId = req.user?.userId || '';

      const employee = await businessOwnerService.addEmployee(businessId, req.body, actorUserId);
      return ApiResponse.created(res, employee, 'Employee added successfully.');
    } catch (err) {
      next(err);
    }
  },

  async quickAddCustomer(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const actorUserId = req.user?.userId || '';

      const customer = await businessOwnerService.addCustomer(businessId, req.body, actorUserId);
      return ApiResponse.created(res, customer, 'Customer registered successfully.');
    } catch (err) {
      next(err);
    }
  },

  async quickCreateInvoice(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const actorUserId = req.user?.userId || '';

      const invoice = await businessOwnerService.createInvoice(businessId, req.body, actorUserId);
      return ApiResponse.created(res, invoice, 'Invoice generated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async quickAddProduct(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const actorUserId = req.user?.userId || '';

      const product = await businessOwnerService.addProduct(businessId, req.body, actorUserId);
      return ApiResponse.created(res, product, 'Product added to inventory catalog.');
    } catch (err) {
      next(err);
    }
  },

  async quickCreatePurchaseOrder(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const actorUserId = req.user?.userId || '';

      const po = await businessOwnerService.createPurchaseOrder(businessId, req.body, actorUserId);
      return ApiResponse.created(res, po, 'Purchase order recorded.');
    } catch (err) {
      next(err);
    }
  },

  async quickCreateProject(req: IAuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const businessId = req.params.businessId as string;
      const actorUserId = req.user?.userId || '';

      const project = await businessOwnerService.createProject(businessId, req.body, actorUserId);
      return ApiResponse.created(res, project, 'Project created successfully.');
    } catch (err) {
      next(err);
    }
  }
};

export default businessOwnerController;

