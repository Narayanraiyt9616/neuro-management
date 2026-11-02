import apiClient from './api';
import {
  IApiResponse,
  ICustomerItem,
  ILeadItem,
  IFollowUpItem,
  ISalesActivity
} from '../types';

export const crmService = {
  configWithBiz(businessId?: string) {
    return businessId ? { headers: { 'x-business-id': businessId } } : {};
  },

  /**
   * ============================================================================
   * MODULE 1: CUSTOMER MANAGEMENT
   * ============================================================================
   */

  async listCustomers(
    businessId: string,
    filters: {
      search?: string;
      status?: string;
      customerType?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ customers: ICustomerItem[]; total: number; page: number; totalPages: number }> {
    const res = (await apiClient.get('/crm/customers', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ customers: ICustomerItem[]; total: number; page: number; totalPages: number }>;
    return res.data || { customers: [], total: 0, page: 1, totalPages: 1 };
  },

  async getCustomerById(businessId: string, customerId: string): Promise<ICustomerItem> {
    const res = (await apiClient.get(`/crm/customers/${customerId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ICustomerItem>;
    return res.data!;
  },

  async createCustomer(businessId: string, data: Partial<ICustomerItem>): Promise<ICustomerItem> {
    const res = (await apiClient.post('/crm/customers', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ICustomerItem>;
    return res.data!;
  },

  async updateCustomer(businessId: string, customerId: string, data: Partial<ICustomerItem>): Promise<ICustomerItem> {
    const res = (await apiClient.put(`/crm/customers/${customerId}`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ICustomerItem>;
    return res.data!;
  },

  async deleteCustomer(businessId: string, customerId: string): Promise<{ success: boolean; message: string }> {
    const res = (await apiClient.delete(`/crm/customers/${customerId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<{ success: boolean; message: string }>;
    return res.data || { success: true, message: 'Customer removed.' };
  },

  async exportCustomersCSV(businessId: string): Promise<string> {
    const res = await apiClient.get('/crm/customers/export', {
      headers: { 'x-business-id': businessId },
      responseType: 'text'
    });
    return res as unknown as string;
  },

  async importCustomers(businessId: string, payload: { csv?: string; rows?: any[] }): Promise<any> {
    const res = (await apiClient.post('/crm/customers/import', payload, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  async getCustomerTimeline(businessId: string, customerId: string): Promise<ISalesActivity[]> {
    const res = (await apiClient.get(`/crm/customers/${customerId}/timeline`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISalesActivity[]>;
    return res.data || [];
  },

  /**
   * ============================================================================
   * MODULE 2: CRM LEADS & KANBAN PIPELINE
   * ============================================================================
   */

  async listLeads(
    businessId: string,
    filters: {
      status?: string;
      source?: string;
      assignedEmployeeId?: string;
      search?: string;
    } = {}
  ): Promise<ILeadItem[]> {
    const res = (await apiClient.get('/crm/leads', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ILeadItem[]>;
    return res.data || [];
  },

  async createLead(businessId: string, data: Partial<ILeadItem>): Promise<ILeadItem> {
    const res = (await apiClient.post('/crm/leads', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ILeadItem>;
    return res.data!;
  },

  async updateLead(businessId: string, leadId: string, data: Partial<ILeadItem>): Promise<ILeadItem> {
    const res = (await apiClient.put(`/crm/leads/${leadId}`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ILeadItem>;
    return res.data!;
  },

  async updateLeadStatus(businessId: string, leadId: string, status: string): Promise<ILeadItem> {
    const res = (await apiClient.patch(
      `/crm/leads/${leadId}/status`,
      { status },
      { headers: { 'x-business-id': businessId } }
    )) as unknown as IApiResponse<ILeadItem>;
    return res.data!;
  },

  async convertLead(businessId: string, leadId: string, data: any): Promise<any> {
    const res = (await apiClient.post(`/crm/leads/${leadId}/convert`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  async deleteLead(businessId: string, leadId: string): Promise<any> {
    const res = (await apiClient.delete(`/crm/leads/${leadId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 3: FOLLOW-UPS & REMINDERS
   * ============================================================================
   */

  async listFollowUps(
    businessId: string,
    filters: {
      status?: string;
      leadId?: string;
      customerId?: string;
      assignedEmployeeId?: string;
    } = {}
  ): Promise<IFollowUpItem[]> {
    const res = (await apiClient.get('/crm/follow-ups', {
      params: filters,
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IFollowUpItem[]>;
    return res.data || [];
  },

  async createFollowUp(businessId: string, data: Partial<IFollowUpItem>): Promise<IFollowUpItem> {
    const res = (await apiClient.post('/crm/follow-ups', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IFollowUpItem>;
    return res.data!;
  },

  async updateFollowUp(businessId: string, followUpId: string, data: Partial<IFollowUpItem>): Promise<IFollowUpItem> {
    const res = (await apiClient.put(`/crm/follow-ups/${followUpId}`, data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<IFollowUpItem>;
    return res.data!;
  },

  async deleteFollowUp(businessId: string, followUpId: string): Promise<any> {
    const res = (await apiClient.delete(`/crm/follow-ups/${followUpId}`, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  /**
   * ============================================================================
   * MODULE 7: CUSTOMER COMMUNICATION & LOGGING
   * ============================================================================
   */

  async recordCommunication(businessId: string, data: {
    customerId?: string;
    leadId?: string;
    type: 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE';
    subject: string;
    body: string;
  }): Promise<any> {
    const res = (await apiClient.post('/crm/communications', data, {
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<any>;
    return res.data;
  },

  async getCommunicationHistory(businessId: string, customerId?: string, leadId?: string): Promise<ISalesActivity[]> {
    const res = (await apiClient.get('/crm/communications', {
      params: { customerId, leadId },
      headers: { 'x-business-id': businessId }
    })) as unknown as IApiResponse<ISalesActivity[]>;
    return res.data || [];
  }
};

export default crmService;

