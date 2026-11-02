import apiClient from './api';
import { IApiResponse, IHealthStatusData } from '../types';

export const healthService = {
  /**
   * Fetch backend system and database health
   */
  async checkHealth(): Promise<IApiResponse<IHealthStatusData>> {
    return apiClient.get<unknown, IApiResponse<IHealthStatusData>>('/health');
  }
};

export default healthService;

