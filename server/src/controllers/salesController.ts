import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import SalesService from '../services/salesService';
import ApiResponse from '../utils/apiResponse';
import {
  salesOrderCreateSchema,
  salesOrderStatusSchema
} from '../validators/salesValidator';
import { extractBusinessId } from './crmController';

function getParamId(req: IAuthRequest): string {
  const id = req.params.id;
  return (Array.isArray(id) ? id[0] : id) || '';
}

export class SalesController {
  /**
   * ============================================================================
   * MODULE 4: SALES MANAGEMENT & ORDERS
   * ============================================================================
   */

  static async listSalesOrders(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);

      // If user is CUSTOMER role, restrict query to their own customer ID if mapped
      const customerFilter = req.user?.role === 'CUSTOMER' ? req.user.userId : (req.query.customerId as string);

      const filters = {
        customerId: customerFilter,
        status: req.query.status as string,
        paymentStatus: req.query.paymentStatus as string,
        search: req.query.search as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
      };

      const result = await SalesService.listSalesOrders(businessId, filters);
      return ApiResponse.success(res, result, 'Sales orders retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getSalesOrderById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const order = await SalesService.getSalesOrderById(businessId, getParamId(req));

      // If customer role, safeguard that they only view their order
      if (req.user?.role === 'CUSTOMER') {
        const orderCustId = (order as any).customerId?._id?.toString() || (order as any).customerId?.toString();
        if (orderCustId !== req.user.userId && (order as any).customerEmail !== req.user.email) {
          return ApiResponse.error(res, 'Access denied: You may only view your own sales orders.', 403);
        }
      }

      return ApiResponse.success(res, order, 'Sales order retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async createSalesOrder(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = salesOrderCreateSchema.parse(req.body);
      const order = await SalesService.createSalesOrder(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, order, 'Sales order created successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateOrderStatus(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = salesOrderStatusSchema.parse(req.body);
      const order = await SalesService.updateOrderStatus(
        businessId,
        getParamId(req),
        validated.status,
        req.user?.userId,
        validated.reason
      );
      return ApiResponse.success(res, order, 'Sales order status updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async cancelSalesOrder(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const reason = req.body.reason || 'Cancelled by operator';
      const order = await SalesService.cancelSalesOrder(businessId, getParamId(req), reason, req.user?.userId);
      return ApiResponse.success(res, order, 'Sales order cancelled and inventory restored.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 6: SALES ANALYTICS
   * ============================================================================
   */

  static async getSalesAnalytics(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const dateRange = req.query.dateRange as string;
      const analytics = await SalesService.getSalesAnalytics(businessId, dateRange);
      return ApiResponse.success(res, analytics, 'Sales analytics data retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export default SalesController;
