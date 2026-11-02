import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import InventoryService from '../services/inventoryService';
import ApiResponse from '../utils/apiResponse';
import {
  productCategorySchema,
  productCategoryUpdateSchema,
  productSchema,
  productUpdateSchema,
  warehouseSchema,
  warehouseUpdateSchema,
  stockMovementSchema,
  stockTransferSchema
} from '../validators/inventoryValidator';
import { extractBusinessId } from './crmController';

function getParamId(req: IAuthRequest): string {
  const id = req.params.id;
  return (Array.isArray(id) ? id[0] : id) || '';
}

export class InventoryController {
  /**
   * ============================================================================
   * MODULE 4: CATEGORY MANAGEMENT
   * ============================================================================
   */

  static async listCategories(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const categories = await InventoryService.listCategories(businessId);
      return ApiResponse.success(res, categories, 'Product categories retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = productCategorySchema.parse(req.body);
      const category = await InventoryService.createCategory(businessId, validated);
      return ApiResponse.created(res, category, 'Product category created successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateCategory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = productCategoryUpdateSchema.parse(req.body);
      const category = await InventoryService.updateCategory(businessId, getParamId(req), validated);
      return ApiResponse.success(res, category, 'Category updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const result = await InventoryService.deleteCategory(businessId, getParamId(req));
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 1: PRODUCT MANAGEMENT & CATALOG
   * ============================================================================
   */

  static async listProducts(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        category: req.query.category as string,
        categoryId: req.query.categoryId as string,
        search: req.query.search as string,
        status: req.query.status as string,
        supplierId: req.query.supplierId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      };

      const result = await InventoryService.listProducts(businessId, filters);
      return ApiResponse.success(res, result, 'Products retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getProductById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const product = await InventoryService.getProductById(businessId, getParamId(req));
      return ApiResponse.success(res, product, 'Product details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = productSchema.parse(req.body);
      const product = await InventoryService.createProduct(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, product, 'Product added to catalog successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = productUpdateSchema.parse(req.body);
      const product = await InventoryService.updateProduct(businessId, getParamId(req), validated, req.user?.userId);
      return ApiResponse.success(res, product, 'Product updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const result = await InventoryService.deleteProduct(businessId, getParamId(req));
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 7: WAREHOUSE MANAGEMENT
   * ============================================================================
   */

  static async listWarehouses(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const warehouses = await InventoryService.listWarehouses(businessId);
      return ApiResponse.success(res, warehouses, 'Warehouses retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async createWarehouse(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = warehouseSchema.parse(req.body);
      const warehouse = await InventoryService.createWarehouse(businessId, validated);
      return ApiResponse.created(res, warehouse, 'Warehouse created successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateWarehouse(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = warehouseUpdateSchema.parse(req.body);
      const warehouse = await InventoryService.updateWarehouse(businessId, getParamId(req), validated);
      return ApiResponse.success(res, warehouse, 'Warehouse updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteWarehouse(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const result = await InventoryService.deleteWarehouse(businessId, getParamId(req));
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 2: STOCK MOVEMENTS & ADJUSTMENTS
   * ============================================================================
   */

  static async recordStockMovement(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = stockMovementSchema.parse(req.body);
      const result = await InventoryService.recordStockMovement(businessId, validated, req.user?.userId);
      return ApiResponse.success(res, result, 'Stock movement recorded successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 7: STOCK TRANSFERS
   * ============================================================================
   */

  static async listStockTransfers(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const transfers = await InventoryService.listStockTransfers(businessId);
      return ApiResponse.success(res, transfers, 'Stock transfers retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async createStockTransfer(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = stockTransferSchema.parse(req.body);
      const transfer = await InventoryService.createStockTransfer(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, transfer, 'Stock transfer completed successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 3: LOW STOCK ALERTS
   * ============================================================================
   */

  static async getLowStockAlerts(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const alerts = await InventoryService.getLowStockAlerts(businessId);
      return ApiResponse.success(res, alerts, 'Low stock alerts retrieved.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 2: STOCK LEDGER AUDIT TRAIL
   * ============================================================================
   */

  static async getStockHistory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        productId: req.query.productId as string,
        warehouseId: req.query.warehouseId as string,
        movementType: req.query.movementType as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      };

      const history = await InventoryService.getStockHistory(businessId, filters);
      return ApiResponse.success(res, history, 'Stock ledger audit trail retrieved.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 8: INVENTORY ANALYTICS & INSIGHTS
   * ============================================================================
   */

  static async getInventoryAnalytics(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const analytics = await InventoryService.getInventoryAnalytics(businessId);
      return ApiResponse.success(res, analytics, 'Inventory analytics retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export default InventoryController;

