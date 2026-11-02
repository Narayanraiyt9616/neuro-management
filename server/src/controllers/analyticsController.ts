import { Response, NextFunction } from 'express';
import AnalyticsService from '../services/analyticsService';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';

function extractBusinessId(req: IAuthRequest): string {
  const headerId = req.headers['x-business-id'] as string;
  const paramId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
  const queryId = req.query.businessId as string;
  const userBizId = req.user?.businessId;
  const bizId = headerId || paramId || queryId || userBizId;
  if (!bizId) throw new Error('Business identifier is required.');
  return Array.isArray(bizId) ? bizId[0] : bizId;
}

export class AnalyticsController {
  static async getAdvancedAnalytics(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const timeframe = (req.query.timeframe as string) || 'last_30_days';
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const data = await AnalyticsService.getAdvancedAnalytics(businessId, timeframe, startDate, endDate);
      return ApiResponse.success(res, data, 'Analytics data retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Analytics error', 500);
    }
  }

  static async exportAnalyticsCsv(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const timeframe = (req.query.timeframe as string) || 'last_30_days';
      const csv = await AnalyticsService.exportAnalyticsCsv(businessId, timeframe);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics_${timeframe}.csv"`);
      return res.status(200).send(csv);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Analytics export failed', 500);
    }
  }
}

export default AnalyticsController;

