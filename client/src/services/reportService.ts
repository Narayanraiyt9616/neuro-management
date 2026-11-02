import apiClient from './api';
import { IBusinessReportData, BusinessReportPeriodType } from '../types';

export const reportService = {
  async generateReport(
    reportType: BusinessReportPeriodType,
    format: 'json' | 'csv' = 'json',
    startDate?: string,
    endDate?: string
  ): Promise<{ success: boolean; data: IBusinessReportData }> {
    const res = await apiClient.post('/reports/generate', {
      reportType,
      format,
      startDate,
      endDate
    });
    return res as unknown as { success: boolean; data: IBusinessReportData };
  },

  async downloadReportCsv(reportType: BusinessReportPeriodType): Promise<string> {
    const res = await apiClient.get('/reports/download', {
      params: { type: reportType },
      responseType: 'text'
    });
    return res as unknown as string;
  }
};

export default reportService;

