import apiClient from './api';
import {
  IPosSessionItem,
  IPosSessionOpenInput,
  IPosSessionCloseInput,
  IPosCashAdjustmentInput,
  IPosCheckoutInput,
  IPosReceipt,
  IPosZReport,
  IPosCartItem
} from '../types';

export const posService = {
  async openSession(input: IPosSessionOpenInput): Promise<{ success: boolean; data: IPosSessionItem; message?: string }> {
    const res = await apiClient.post('/pos/sessions/open', input);
    return res as unknown as { success: boolean; data: IPosSessionItem; message?: string };
  },

  async getCurrentSession(): Promise<{ success: boolean; data: IPosSessionItem | null; message?: string }> {
    const res = await apiClient.get('/pos/sessions/current');
    return res as unknown as { success: boolean; data: IPosSessionItem | null; message?: string };
  },

  async closeSession(sessionId: string, input: IPosSessionCloseInput): Promise<{ success: boolean; data: IPosSessionItem; message?: string }> {
    const res = await apiClient.post(`/pos/sessions/${sessionId}/close`, input);
    return res as unknown as { success: boolean; data: IPosSessionItem; message?: string };
  },

  async adjustCash(sessionId: string, input: IPosCashAdjustmentInput): Promise<{ success: boolean; data: IPosSessionItem; message?: string }> {
    const res = await apiClient.post(`/pos/sessions/${sessionId}/adjust-cash`, input);
    return res as unknown as { success: boolean; data: IPosSessionItem; message?: string };
  },

  async searchCatalog(query: string = ''): Promise<{ success: boolean; data: any[]; message?: string }> {
    const res = await apiClient.get(`/pos/catalog/search?q=${encodeURIComponent(query)}`);
    return res as unknown as { success: boolean; data: any[]; message?: string };
  },

  async processCheckout(input: IPosCheckoutInput): Promise<{ success: boolean; data: IPosReceipt; message?: string }> {
    const res = await apiClient.post('/pos/checkout', input);
    return res as unknown as { success: boolean; data: IPosReceipt; message?: string };
  },

  async holdCart(sessionId: string, payload: { holdRef?: string; customerName?: string; items: IPosCartItem[] }): Promise<{ success: boolean; data: any }> {
    const res = await apiClient.post(`/pos/sessions/${sessionId}/hold`, payload);
    return res as unknown as { success: boolean; data: any };
  },

  async getHeldCarts(sessionId: string): Promise<{ success: boolean; data: any[] }> {
    const res = await apiClient.get(`/pos/sessions/${sessionId}/held`);
    return res as unknown as { success: boolean; data: any[] };
  },

  async removeHeldCart(sessionId: string, holdId: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete(`/pos/sessions/${sessionId}/held/${holdId}`);
    return res as unknown as { success: boolean };
  },

  async getZReport(sessionId: string): Promise<{ success: boolean; data: IPosZReport }> {
    const res = await apiClient.get(`/pos/sessions/${sessionId}/z-report`);
    return res as unknown as { success: boolean; data: IPosZReport };
  }
};

export default posService;
