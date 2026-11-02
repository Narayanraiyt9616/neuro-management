import apiClient from './api';
import {
  IApiResponse,
  ISalesOrder,
  ISalesAnalyticsData,
  SalesOrderStatusOption
} from '../types';

export const salesService = {
  configWithBiz(businessId?: string) {
    return businessId ? { headers: { 'x-business-id': businessId } } : {};
  },

  /**
   * ============================================================================
   * MODULE 4: SALES MANAGEMENT & ORDERS
   * ============================================================================
   */

  async listSalesOrders(
    businessId: string,
    filters: {
      customerId?: string;
      status?: string;
      paymentStatus?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ orders: ISalesOrder[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/sales/orders', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ orders: ISalesOrder[]; total: number; page: number; totalPages: number }>;
    return res.data || { orders: [], total: 0, page: 1, totalPages: 1 };
  },

  async getSalesOrderById(businessId: string, orderId: string): Promise<ISalesOrder> {
    const res = (await apiClient.get(`/sales/orders/${orderId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISalesOrder>;
    return res.data!;
  },

  async createSalesOrder(businessId: string, data: any): Promise<ISalesOrder> {
    const res = (await apiClient.post('/sales/orders', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISalesOrder>;
    return res.data!;
  },

  async updateOrderStatus(
    businessId: string,
    orderId: string,
    status: SalesOrderStatusOption,
    reason?: string
  ): Promise<ISalesOrder> {
    const res = (await apiClient.patch(
      `/sales/orders/${orderId}/status`,
      { status, reason },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<ISalesOrder>;
    return res.data!;
  },

  async cancelSalesOrder(businessId: string, orderId: string, reason?: string): Promise<ISalesOrder> {
    const res = (await apiClient.post(
      `/sales/orders/${orderId}/cancel`,
      { reason },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<ISalesOrder>;
    return res.data!;
  },

  /**
   * ============================================================================
   * MODULE 6: SALES ANALYTICS
   * ============================================================================
   */

  async getSalesAnalytics(businessId: string, dateRange?: string): Promise<ISalesAnalyticsData> {
    const res = (await apiClient.get('/sales/analytics', {
      params: { dateRange },
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISalesAnalyticsData>;
    return (
      res.data || {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        pendingOrdersCount: 0,
        wonLeadsCount: 0,
        lostLeadsCount: 0,
        conversionRate: 0,
        monthlySales: [],
        salesByEmployee: [],
        salesByCustomer: [],
        pipelineDistribution: []
      }
    );
  }
};

export default salesService;

