import apiClient from './api';
import { IAdvancedAnalyticsData } from '../types';

export const analyticsService = {
  async getAdvancedAnalytics(timeframe: string = 'last_30_days', startDate?: string, endDate?: string): Promise<{ success: boolean; data: IAdvancedAnalyticsData }> {
    const res = await apiClient.get('/analytics', {
      params: { timeframe, startDate, endDate }
    });
    return res as unknown as { success: boolean; data: IAdvancedAnalyticsData };
  },

  async exportAnalyticsCsv(timeframe: string = 'last_30_days'): Promise<string> {
    const res = await apiClient.get('/analytics/export', {
      params: { timeframe },
      responseType: 'text'
    });
    return res as unknown as string;
  }
};

export default analyticsService;

