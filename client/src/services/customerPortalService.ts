import apiClient from './api';
import {
  ICustomerPortalStats,
  ISupportTicketItem,
  ICreateTicketInput,
  ICustomerPayInvoiceInput
} from '../types';

export const customerPortalService = {
  async getDashboardStats(): Promise<{ success: boolean; data: ICustomerPortalStats; message?: string }> {
    const res = await apiClient.get('/portal/stats');
    return res as unknown as { success: boolean; data: ICustomerPortalStats; message?: string };
  },

  async getOrders(): Promise<{ success: boolean; data: any[]; message?: string }> {
    const res = await apiClient.get('/portal/orders');
    return res as unknown as { success: boolean; data: any[]; message?: string };
  },

  async getInvoices(): Promise<{ success: boolean; data: any[]; message?: string }> {
    const res = await apiClient.get('/portal/invoices');
    return res as unknown as { success: boolean; data: any[]; message?: string };
  },

  async payInvoice(
    invoiceId: string,
    input: ICustomerPayInvoiceInput
  ): Promise<{ success: boolean; data: { invoice: any; payment: any; receipt: any }; message?: string }> {
    const res = await apiClient.post(`/portal/invoices/${invoiceId}/pay`, input);
    return res as unknown as { success: boolean; data: { invoice: any; payment: any; receipt: any }; message?: string };
  },

  async decideQuote(
    quoteId: string,
    decision: 'ACCEPT' | 'DECLINE',
    notes?: string
  ): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await apiClient.post(`/portal/quotes/${quoteId}/decision`, { decision, notes });
    return res as unknown as { success: boolean; data: any; message?: string };
  },

  async listTickets(): Promise<{ success: boolean; data: ISupportTicketItem[]; message?: string }> {
    const res = await apiClient.get('/portal/tickets');
    return res as unknown as { success: boolean; data: ISupportTicketItem[]; message?: string };
  },

  async getTicketById(ticketId: string): Promise<{ success: boolean; data: ISupportTicketItem; message?: string }> {
    const res = await apiClient.get(`/portal/tickets/${ticketId}`);
    return res as unknown as { success: boolean; data: ISupportTicketItem; message?: string };
  },

  async createTicket(input: ICreateTicketInput): Promise<{ success: boolean; data: ISupportTicketItem; message?: string }> {
    const res = await apiClient.post('/portal/tickets', input);
    return res as unknown as { success: boolean; data: ISupportTicketItem; message?: string };
  },

  async replyTicket(
    ticketId: string,
    message: string,
    attachments?: string[]
  ): Promise<{ success: boolean; data: ISupportTicketItem; message?: string }> {
    const res = await apiClient.post(`/portal/tickets/${ticketId}/reply`, { message, attachments });
    return res as unknown as { success: boolean; data: ISupportTicketItem; message?: string };
  },

  async updateProfile(profileData: any): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await apiClient.put('/portal/profile', profileData);
    return res as unknown as { success: boolean; data: any; message?: string };
  }
};

export default customerPortalService;

