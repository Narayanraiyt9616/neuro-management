import apiClient from './api';
import {
  IBranchItem,
  IBranchInput,
  IBranchAnalytics,
  IBranchTransferInput
} from '../types';

export const branchService = {
  async getBranches(params?: {
    search?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: { items: IBranchItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } } }> {
    const res = await apiClient.get('/branches', { params });
    return res as unknown as { success: boolean; data: { items: IBranchItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } } };
  },

  async getBranchById(id: string): Promise<{ success: boolean; data: IBranchItem }> {
    const res = await apiClient.get(`/branches/${id}`);
    return res as unknown as { success: boolean; data: IBranchItem };
  },

  async createBranch(input: IBranchInput): Promise<{ success: boolean; data: IBranchItem; message?: string }> {
    const res = await apiClient.post('/branches', input);
    return res as unknown as { success: boolean; data: IBranchItem; message?: string };
  },

  async updateBranch(id: string, updates: Partial<IBranchInput>): Promise<{ success: boolean; data: IBranchItem; message?: string }> {
    const res = await apiClient.put(`/branches/${id}`, updates);
    return res as unknown as { success: boolean; data: IBranchItem; message?: string };
  },

  async deleteBranch(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/branches/${id}`);
    return res as unknown as { success: boolean; message: string };
  },

  async getBranchAnalytics(id: string): Promise<{ success: boolean; data: IBranchAnalytics }> {
    const res = await apiClient.get(`/branches/${id}/analytics`);
    return res as unknown as { success: boolean; data: IBranchAnalytics };
  },

  async transferStock(input: IBranchTransferInput): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await apiClient.post('/branches/transfer-stock', input);
    return res as unknown as { success: boolean; data: any; message?: string };
  }
};

export default branchService;

