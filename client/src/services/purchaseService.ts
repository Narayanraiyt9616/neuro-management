import apiClient from './api';
import {
  IApiResponse,
  ISupplierItem,
  IPurchaseOrder
} from '../types';

export const purchaseService = {
  configWithBiz(businessId?: string) {
    return businessId ? { headers: { 'x-business-id': businessId } } : {};
  },

  /**
   * ============================================================================
   * MODULE 5: SUPPLIER MANAGEMENT
   * ============================================================================
   */

  async listSuppliers(businessId: string, filters: { search?: string; status?: string } = {}): Promise<ISupplierItem[]> {
    const res = (await apiClient.get('/purchase/suppliers', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISupplierItem[]>;
    return res.data || [];
  },

  async getSupplierById(businessId: string, supplierId: string): Promise<ISupplierItem> {
    const res = (await apiClient.get(`/purchase/suppliers/${supplierId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISupplierItem>;
    return res.data!;
  },

  async createSupplier(businessId: string, data: Partial<ISupplierItem>): Promise<ISupplierItem> {
    const res = (await apiClient.post('/purchase/suppliers', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISupplierItem>;
    return res.data!;
  },

  async updateSupplier(businessId: string, supplierId: string, data: Partial<ISupplierItem>): Promise<ISupplierItem> {
    const res = (await apiClient.put(`/purchase/suppliers/${supplierId}`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISupplierItem>;
    return res.data!;
  },

  async deleteSupplier(businessId: string, supplierId: string): Promise<any> {
    const res = (await apiClient.delete(`/purchase/suppliers/${supplierId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 6: PURCHASE ORDER MANAGEMENT
   * ============================================================================
   */

  async listPurchaseOrders(
    businessId: string,
    filters: {
      status?: string;
      supplierId?: string;
      warehouseId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ orders: IPurchaseOrder[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/purchase/orders', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ orders: IPurchaseOrder[]; total: number; page: number; totalPages: number }>;
    return res.data || { orders: [], total: 0, page: 1, totalPages: 1 };
  },

  async getPurchaseOrderById(businessId: string, poId: string): Promise<IPurchaseOrder> {
    const res = (await apiClient.get(`/purchase/orders/${poId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IPurchaseOrder>;
    return res.data!;
  },

  async createPurchaseOrder(businessId: string, data: any): Promise<IPurchaseOrder> {
    const res = (await apiClient.post('/purchase/orders', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IPurchaseOrder>;
    return res.data!;
  },

  async approvePurchaseOrder(businessId: string, poId: string): Promise<IPurchaseOrder> {
    const res = (await apiClient.patch(`/purchase/orders/${poId}/approve`, {}, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IPurchaseOrder>;
    return res.data!;
  },

  async receivePurchaseItems(
    businessId: string,
    poId: string,
    data: {
      receivedItems: Array<{ productId: string; quantityReceived: number }>;
      notes?: string;
      idempotencyKey?: string;
    }
  ): Promise<IPurchaseOrder> {
    const res = (await apiClient.post(`/purchase/orders/${poId}/receive`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IPurchaseOrder>;
    return res.data!;
  },

  async cancelPurchaseOrder(businessId: string, poId: string, reason?: string): Promise<IPurchaseOrder> {
    const res = (await apiClient.post(
      `/purchase/orders/${poId}/cancel`,
      { reason },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<IPurchaseOrder>;
    return res.data!;
  }
};

export default purchaseService;

