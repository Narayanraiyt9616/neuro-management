import apiClient from './api';
import {
  IApiResponse,
  IProductCategory,
  IProductItem,
  IWarehouseItem,
  IStockLedgerItem,
  IStockTransferItem,
  ILowStockAlertItem,
  IInventoryAnalyticsData
} from '../types';

export const inventoryService = {
  configWithBiz(businessId?: string) {
    return businessId ? { headers: { 'x-business-id': businessId } } : {};
  },

  /**
   * ============================================================================
   * MODULE 4: CATEGORY MANAGEMENT
   * ============================================================================
   */

  async listCategories(businessId: string): Promise<IProductCategory[]> {
    const res = (await apiClient.get('/inventory/categories', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IProductCategory[]>;
    return res.data || [];
  },

  async createCategory(businessId: string, data: Partial<IProductCategory>): Promise<IProductCategory> {
    const res = (await apiClient.post('/inventory/categories', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IProductCategory>;
    return res.data!;
  },

  async updateCategory(businessId: string, categoryId: string, data: Partial<IProductCategory>): Promise<IProductCategory> {
    const res = (await apiClient.put(`/inventory/categories/${categoryId}`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IProductCategory>;
    return res.data!;
  },

  async deleteCategory(businessId: string, categoryId: string): Promise<any> {
    const res = (await apiClient.delete(`/inventory/categories/${categoryId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 1: PRODUCT CATALOG
   * ============================================================================
   */

  async listProducts(
    businessId: string,
    filters: {
      category?: string;
      categoryId?: string;
      search?: string;
      status?: string;
      supplierId?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ products: IProductItem[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/inventory/products', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ products: IProductItem[]; total: number; page: number; totalPages: number }>;
    return res.data || { products: [], total: 0, page: 1, totalPages: 1 };
  },

  async getProductById(businessId: string, productId: string): Promise<IProductItem> {
    const res = (await apiClient.get(`/inventory/products/${productId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IProductItem>;
    return res.data!;
  },

  async createProduct(businessId: string, data: Partial<IProductItem>): Promise<IProductItem> {
    const res = (await apiClient.post('/inventory/products', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IProductItem>;
    return res.data!;
  },

  async updateProduct(businessId: string, productId: string, data: Partial<IProductItem>): Promise<IProductItem> {
    const res = (await apiClient.put(`/inventory/products/${productId}`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IProductItem>;
    return res.data!;
  },

  async deleteProduct(businessId: string, productId: string): Promise<any> {
    const res = (await apiClient.delete(`/inventory/products/${productId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 7: WAREHOUSES
   * ============================================================================
   */

  async listWarehouses(businessId: string): Promise<IWarehouseItem[]> {
    const res = (await apiClient.get('/inventory/warehouses', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IWarehouseItem[]>;
    return res.data || [];
  },

  async createWarehouse(businessId: string, data: Partial<IWarehouseItem>): Promise<IWarehouseItem> {
    const res = (await apiClient.post('/inventory/warehouses', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IWarehouseItem>;
    return res.data!;
  },

  async updateWarehouse(businessId: string, warehouseId: string, data: Partial<IWarehouseItem>): Promise<IWarehouseItem> {
    const res = (await apiClient.put(`/inventory/warehouses/${warehouseId}`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IWarehouseItem>;
    return res.data!;
  },

  async deleteWarehouse(businessId: string, warehouseId: string): Promise<any> {
    const res = (await apiClient.delete(`/inventory/warehouses/${warehouseId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 2: STOCK MOVEMENTS & ADJUSTMENTS
   * ============================================================================
   */

  async recordStockMovement(businessId: string, data: {
    productId: string;
    warehouseId?: string;
    movementType: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
    quantity: number;
    reason?: string;
  }): Promise<any> {
    const res = (await apiClient.post('/inventory/stock-movements', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  async getStockHistory(
    businessId: string,
    filters: {
      productId?: string;
      warehouseId?: string;
      movementType?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ ledger: IStockLedgerItem[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/inventory/stock-ledger', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ ledger: IStockLedgerItem[]; total: number; page: number; totalPages: number }>;
    return res.data || { ledger: [], total: 0, page: 1, totalPages: 1 };
  },

  /**
   * ============================================================================
   * MODULE 7: STOCK TRANSFERS
   * ============================================================================
   */

  async listStockTransfers(businessId: string): Promise<IStockTransferItem[]> {
    const res = (await apiClient.get('/inventory/stock-transfers', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IStockTransferItem[]>;
    return res.data || [];
  },

  async createStockTransfer(businessId: string, data: {
    fromWarehouseId: string;
    toWarehouseId: string;
    items: Array<{ productId: string; quantity: number }>;
    notes?: string;
  }): Promise<IStockTransferItem> {
    const res = (await apiClient.post('/inventory/stock-transfers', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IStockTransferItem>;
    return res.data!;
  },

  /**
   * ============================================================================
   * MODULE 3: LOW STOCK ALERTS & MODULE 8: ANALYTICS
   * ============================================================================
   */

  async getLowStockAlerts(businessId: string): Promise<ILowStockAlertItem[]> {
    const res = (await apiClient.get('/inventory/low-stock-alerts', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ILowStockAlertItem[]>;
    return res.data || [];
  },

  async getInventoryAnalytics(businessId: string): Promise<IInventoryAnalyticsData> {
    const res = (await apiClient.get('/inventory/analytics', {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IInventoryAnalyticsData>;
    return (
      res.data || {
        totalProducts: 0,
        totalStockValue: 0,
        lowStockProductsCount: 0,
        outOfStockProductsCount: 0,
        totalWarehousesCount: 0,
        totalSuppliersCount: 0,
        lowStockAlerts: [],
        stockMovementSummary: { totalStockIn: 0, totalStockOut: 0, totalAdjustments: 0 },
        purchaseSummary: { totalPurchaseOrders: 0, pendingOrdersCount: 0, totalPurchaseSpend: 0 }
      }
    );
  }
};

export default inventoryService;

