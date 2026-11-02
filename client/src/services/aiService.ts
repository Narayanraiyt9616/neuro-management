import apiClient from './api';
import { IAiQueryResponse, IAiBusinessInsights } from '../types';

export const aiService = {
  async askAssistant(question: string, context?: Record<string, unknown>): Promise<{ success: boolean; data: IAiQueryResponse; message?: string }> {
    const res = await apiClient.post('/ai/query', { question, context });
    return res as unknown as { success: boolean; data: IAiQueryResponse; message?: string };
  },

  async getInsights(): Promise<{ success: boolean; data: IAiBusinessInsights }> {
    const res = await apiClient.get('/ai/insights');
    return res as unknown as { success: boolean; data: IAiBusinessInsights };
  }
};

export default aiService;

