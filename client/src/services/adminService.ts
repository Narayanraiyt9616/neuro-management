import apiClient from './api';
import {
  IApiResponse,
  IPlatformStats,
  IBusiness,
  IBusinessRegistrationInput,
  ISubscriptionPlan,
  IPlatformSettings,
  IAdminUserItem,
  IAuditLogItem,
  IPaymentGatewayIntentResult
} from '../types';

export const adminService = {
  /**
   * Fetch platform overview statistics from MongoDB
   */
  async getOverviewStats(): Promise<IPlatformStats> {
    const res = (await apiClient.get('/admin/stats')) as unknown as IApiResponse<IPlatformStats>;
    if (!res.data) throw new Error(res.message || 'Failed to fetch platform statistics');
    return res.data;
  },

  /**
   * Register a new business organization (status: PENDING)
   */
  async registerBusiness(data: IBusinessRegistrationInput): Promise<IBusiness> {
    const res = (await apiClient.post('/business/register', data)) as unknown as IApiResponse<IBusiness>;
    if (!res.data) throw new Error(res.message || 'Business registration failed');
    return res.data;
  },

  /**
   * Get all businesses with search, status filtering and pagination
   */
  async getBusinesses(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: IBusiness[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const res = (await apiClient.get('/admin/businesses', { params })) as unknown as IApiResponse<{
      items: IBusiness[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>;
    return res.data || { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  /**
   * Get business details by ID
   */
  async getBusinessById(id: string): Promise<IBusiness & { recentLogs?: IAuditLogItem[] }> {
    const res = (await apiClient.get(`/admin/businesses/${id}`)) as unknown as IApiResponse<
      IBusiness & { recentLogs?: IAuditLogItem[] }
    >;
    if (!res.data) throw new Error(res.message || 'Business details not found');
    return res.data;
  },

  /**
   * Approve business application -> Sets status to ACTIVE
   */
  async approveBusiness(id: string): Promise<IBusiness> {
    const res = (await apiClient.patch(`/admin/businesses/${id}/approve`, {})) as unknown as IApiResponse<IBusiness>;
    if (!res.data) throw new Error(res.message || 'Approval failed');
    return res.data;
  },

  /**
   * Reject business application with reason
   */
  async rejectBusiness(id: string, reason: string): Promise<IBusiness> {
    const res = (await apiClient.patch(`/admin/businesses/${id}/reject`, { reason })) as unknown as IApiResponse<IBusiness>;
    if (!res.data) throw new Error(res.message || 'Rejection failed');
    return res.data;
  },

  /**
   * Suspend business with reason
   */
  async suspendBusiness(id: string, reason: string): Promise<IBusiness> {
    const res = (await apiClient.patch(`/admin/businesses/${id}/suspend`, { reason })) as unknown as IApiResponse<IBusiness>;
    if (!res.data) throw new Error(res.message || 'Suspension failed');
    return res.data;
  },

  /**
   * Reactivate suspended business
   */
  async reactivateBusiness(id: string): Promise<IBusiness> {
    const res = (await apiClient.patch(`/admin/businesses/${id}/reactivate`, {})) as unknown as IApiResponse<IBusiness>;
    if (!res.data) throw new Error(res.message || 'Reactivation failed');
    return res.data;
  },

  /**
   * Edit business details
   */
  async editBusiness(id: string, updates: Partial<IBusiness>): Promise<IBusiness> {
    const res = (await apiClient.put(`/admin/businesses/${id}`, updates)) as unknown as IApiResponse<IBusiness>;
    if (!res.data) throw new Error(res.message || 'Update failed');
    return res.data;
  },

  /**
   * Get 4 subscription plans
   */
  async getSubscriptionPlans(): Promise<ISubscriptionPlan[]> {
    const res = (await apiClient.get('/admin/plans')) as unknown as IApiResponse<ISubscriptionPlan[]>;
    return res.data || [];
  },

  /**
   * Edit subscription plan (pricing, limits, modules)
   */
  async updateSubscriptionPlan(id: string, data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan> {
    const res = (await apiClient.put(`/admin/plans/${id}`, data)) as unknown as IApiResponse<ISubscriptionPlan>;
    if (!res.data) throw new Error(res.message || 'Plan update failed');
    return res.data;
  },

  /**
   * Get subscriptions with renewal & expiration status
   */
  async getSubscriptions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; pagination: any }> {
    const res = (await apiClient.get('/admin/subscriptions', { params })) as unknown as IApiResponse<{
      items: any[];
      pagination: any;
    }>;
    return res.data || { items: [], pagination: { total: 0 } };
  },

  /**
   * Create payment gateway intent for Razorpay / Stripe
   */
  async createPaymentGatewayIntent(data: {
    businessId: string;
    planCode: string;
    billingCycle: 'monthly' | 'annual';
    provider: 'stripe' | 'razorpay';
  }): Promise<IPaymentGatewayIntentResult> {
    const res = (await apiClient.post(
      '/admin/subscriptions/payment-gateway-intent',
      data
    )) as unknown as IApiResponse<IPaymentGatewayIntentResult>;
    if (!res.data) throw new Error(res.message || 'Payment intent creation failed');
    return res.data;
  },

  /**
   * Super Admin user management: list users
   */
  async getUsers(params?: {
    search?: string;
    role?: string;
    businessId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: IAdminUserItem[]; pagination: any }> {
    const res = (await apiClient.get('/admin/users', { params })) as unknown as IApiResponse<{
      items: IAdminUserItem[];
      pagination: any;
    }>;
    return res.data || { items: [], pagination: { total: 0 } };
  },

  /**
   * Super Admin user management: activate / deactivate user
   */
  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<IAdminUserItem> {
    const res = (await apiClient.patch(`/admin/users/${userId}/status`, { status })) as unknown as IApiResponse<IAdminUserItem>;
    if (!res.data) throw new Error(res.message || 'Status update failed');
    return res.data;
  },

  /**
   * Get audit logs
   */
  async getAuditLogs(params?: {
    module?: string;
    action?: string;
    businessId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: IAuditLogItem[]; pagination: any }> {
    const res = (await apiClient.get('/admin/audit-logs', { params })) as unknown as IApiResponse<{
      items: IAuditLogItem[];
      pagination: any;
    }>;
    return res.data || { items: [], pagination: { total: 0 } };
  },

  /**
   * Get platform administration settings
   */
  async getPlatformSettings(): Promise<IPlatformSettings> {
    const res = (await apiClient.get('/admin/settings')) as unknown as IApiResponse<IPlatformSettings>;
    if (!res.data) throw new Error(res.message || 'Settings not found');
    return res.data;
  },

  /**
   * Update platform administration settings
   */
  async updatePlatformSettings(data: Partial<IPlatformSettings>): Promise<IPlatformSettings> {
    const res = (await apiClient.put('/admin/settings', data)) as unknown as IApiResponse<IPlatformSettings>;
    if (!res.data) throw new Error(res.message || 'Settings update failed');
    return res.data;
  }
};

export default adminService;

