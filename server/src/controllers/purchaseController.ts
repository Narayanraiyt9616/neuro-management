import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import PurchaseService from '../services/purchaseService';
import ApiResponse from '../utils/apiResponse';
import {
  supplierSchema,
  supplierUpdateSchema,
  purchaseOrderCreateSchema,
  purchaseOrderReceiveSchema
} from '../validators/purchaseValidator';
import { extractBusinessId } from './crmController';

function getParamId(req: IAuthRequest): string {
  const id = req.params.id;
  return (Array.isArray(id) ? id[0] : id) || '';
}

export class PurchaseController {
  /**
   * ============================================================================
   * MODULE 5: SUPPLIER MANAGEMENT
   * ============================================================================
   */

  static async listSuppliers(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string
      };

      const suppliers = await PurchaseService.listSuppliers(businessId, filters);
      return ApiResponse.success(res, suppliers, 'Suppliers retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getSupplierById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const supplier = await PurchaseService.getSupplierById(businessId, getParamId(req));
      return ApiResponse.success(res, supplier, 'Supplier profile retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async createSupplier(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = supplierSchema.parse(req.body);
      const supplier = await PurchaseService.createSupplier(businessId, validated);
      return ApiResponse.created(res, supplier, 'Supplier created successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateSupplier(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = supplierUpdateSchema.parse(req.body);
      const supplier = await PurchaseService.updateSupplier(businessId, getParamId(req), validated);
      return ApiResponse.success(res, supplier, 'Supplier updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteSupplier(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const result = await PurchaseService.deleteSupplier(businessId, getParamId(req));
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 6: PURCHASE ORDER MANAGEMENT
   * ============================================================================
   */

  static async listPurchaseOrders(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        status: req.query.status as string,
        supplierId: req.query.supplierId as string,
        warehouseId: req.query.warehouseId as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
      };

      const result = await PurchaseService.listPurchaseOrders(businessId, filters);
      return ApiResponse.success(res, result, 'Purchase orders retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async getPurchaseOrderById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const order = await PurchaseService.getPurchaseOrderById(businessId, getParamId(req));
      return ApiResponse.success(res, order, 'Purchase order retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async createPurchaseOrder(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = purchaseOrderCreateSchema.parse(req.body);
      const order = await PurchaseService.createPurchaseOrder(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, order, 'Purchase order generated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async approvePurchaseOrder(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const order = await PurchaseService.approvePurchaseOrder(businessId, getParamId(req), req.user?.userId);
      return ApiResponse.success(res, order, 'Purchase order approved. Pending goods receipt.');
    } catch (err) {
      next(err);
    }
  }

  static async receivePurchaseItems(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = purchaseOrderReceiveSchema.parse(req.body);
      const order = await PurchaseService.receivePurchaseItems(
        businessId,
        getParamId(req),
        validated,
        req.user?.userId
      );
      return ApiResponse.success(res, order, 'Goods received, inventory increased, and stock ledger logged.');
    } catch (err) {
      next(err);
    }
  }

  static async cancelPurchaseOrder(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const reason = req.body.reason || 'Cancelled by purchasing manager';
      const order = await PurchaseService.cancelPurchaseOrder(businessId, getParamId(req), reason, req.user?.userId);
      return ApiResponse.success(res, order, 'Purchase order cancelled.');
    } catch (err) {
      next(err);
    }
  }
}

export default PurchaseController;

