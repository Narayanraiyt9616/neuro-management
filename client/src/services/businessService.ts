import apiClient from './api';
import {
  IApiResponse,
  IBusiness,
  IBusinessDashboardStats,
  IBusinessAnalytics,
  IBusinessProfileUpdate,
  IBusinessFullSettings,
  IAddEmployeeInput,
  IAddCustomerInput,
  ICreateInvoiceInput,
  IAddProductInput,
  ICreatePurchaseOrderInput,
  ICreateProjectInput,
  IAuditLogItem
} from '../types';

export const businessService = {
  /**
   * 1. Get Dashboard Statistics for a specific business
   */
  async getDashboardStats(
    businessId: string,
    filter: { period?: string; startDate?: string; endDate?: string } = {}
  ): Promise<IBusinessDashboardStats> {
    const res = (await apiClient.get(`/business/${businessId}/dashboard/stats`, {
      params: filter
    })) as unknown as IApiResponse<IBusinessDashboardStats>;
    if (!res.data) throw new Error(res.message || 'Failed to fetch dashboard statistics');
    return res.data;
  },

  /**
   * 2. Get Analytics for all 6 charts
   */
  async getAnalytics(
    businessId: string,
    filter: { period?: string; startDate?: string; endDate?: string } = {}
  ): Promise<IBusinessAnalytics> {
    const res = (await apiClient.get(`/business/${businessId}/dashboard/analytics`, {
      params: filter
    })) as unknown as IApiResponse<IBusinessAnalytics>;
    if (!res.data) throw new Error(res.message || 'Failed to fetch analytics data');
    return res.data;
  },

  /**
   * 3. Get Recent Activities
   */
  async getRecentActivities(businessId: string, limit = 10): Promise<IAuditLogItem[]> {
    const res = (await apiClient.get(`/business/${businessId}/dashboard/activities`, {
      params: { limit }
    })) as unknown as IApiResponse<IAuditLogItem[]>;
    return res.data || [];
  },

  /**
   * 3.1. Get Paginated Audit Logs for Business
   */
  async getAuditLogs(
    businessId: string,
    params: { module?: string; action?: string; page?: number; limit?: number } = {}
  ): Promise<{ items: IAuditLogItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const res = (await apiClient.get(`/business/${businessId}/audit-logs`, {
      params
    })) as unknown as IApiResponse<{ items: IAuditLogItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>;
    return res.data || { items: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } };
  },

  /**
   * 4. Get Accessible Businesses for Business Switcher
   */
  async getMyBusinesses(): Promise<IBusiness[]> {
    const res = (await apiClient.get('/business/my-businesses')) as unknown as IApiResponse<IBusiness[]>;
    return res.data || [];
  },

  /**
   * 5. Update Business Profile
   */
  async updateBusinessProfile(businessId: string, updates: IBusinessProfileUpdate): Promise<IBusiness> {
    const res = (await apiClient.put(`/business/${businessId}/profile`, updates)) as unknown as IApiResponse<IBusiness>;
    if (!res.data) throw new Error(res.message || 'Failed to update business profile');
    return res.data;
  },

  /**
   * 6. Update Business Settings
   */
  async updateBusinessSettings(businessId: string, settings: IBusinessFullSettings): Promise<any> {
    const res = (await apiClient.put(`/business/${businessId}/settings`, settings)) as unknown as IApiResponse<any>;
    if (!res.data) throw new Error(res.message || 'Failed to update business settings');
    return res.data;
  },

  // ==========================================
  // QUICK ACTIONS
  // ==========================================

  async addEmployee(businessId: string, input: IAddEmployeeInput): Promise<any> {
    const res = (await apiClient.post(
      `/business/${businessId}/quick-actions/employee`,
      input
    )) as unknown as IApiResponse<any>;
    if (!res.data) throw new Error(res.message || 'Failed to add employee');
    return res.data;
  },

  async addCustomer(businessId: string, input: IAddCustomerInput): Promise<any> {
    const res = (await apiClient.post(
      `/business/${businessId}/quick-actions/customer`,
      input
    )) as unknown as IApiResponse<any>;
    if (!res.data) throw new Error(res.message || 'Failed to add customer');
    return res.data;
  },

  async createInvoice(businessId: string, input: ICreateInvoiceInput): Promise<any> {
    const res = (await apiClient.post(
      `/business/${businessId}/quick-actions/invoice`,
      input
    )) as unknown as IApiResponse<any>;
    if (!res.data) throw new Error(res.message || 'Failed to create invoice');
    return res.data;
  },

  async addProduct(businessId: string, input: IAddProductInput): Promise<any> {
    const res = (await apiClient.post(
      `/business/${businessId}/quick-actions/product`,
      input
    )) as unknown as IApiResponse<any>;
    if (!res.data) throw new Error(res.message || 'Failed to add product');
    return res.data;
  },

  async createPurchaseOrder(businessId: string, input: ICreatePurchaseOrderInput): Promise<any> {
    const res = (await apiClient.post(
      `/business/${businessId}/quick-actions/purchase-order`,
      input
    )) as unknown as IApiResponse<any>;
    if (!res.data) throw new Error(res.message || 'Failed to record purchase order');
    return res.data;
  },

  async createProject(businessId: string, input: ICreateProjectInput): Promise<any> {
    const res = (await apiClient.post(
      `/business/${businessId}/quick-actions/project`,
      input
    )) as unknown as IApiResponse<any>;
    if (!res.data) throw new Error(res.message || 'Failed to create project');
    return res.data;
  }
};

export default businessService;

