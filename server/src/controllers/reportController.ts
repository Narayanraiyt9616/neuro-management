import { Response, NextFunction } from 'express';
import ReportService from '../services/reportService';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';
import { reportGenerateSchema } from '../validators/reportValidator';

function extractBusinessId(req: IAuthRequest): string {
  const headerId = req.headers['x-business-id'] as string;
  const paramId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
  const queryId = req.query.businessId as string;
  const userBizId = req.user?.businessId;
  const bizId = headerId || paramId || queryId || userBizId;
  if (!bizId) throw new Error('Business identifier is required.');
  return Array.isArray(bizId) ? bizId[0] : bizId;
}

export class ReportController {
  static async generateReport(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = reportGenerateSchema.parse(req.body);
      const actorName = req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || req.user.email : 'Executive Management';

      if (validated.format === 'csv') {
        const csv = await ReportService.exportReportCsv(businessId, validated.reportType);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="report_${validated.reportType.toLowerCase()}.csv"`);
        return res.status(200).send(csv);
      }

      const report = await ReportService.generateReport(
        businessId,
        validated.reportType,
        validated.startDate,
        validated.endDate,
        actorName
      );
      return ApiResponse.success(res, report, 'Business report generated.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Report generation failed', 500);
    }
  }

  static async downloadReportCsv(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const reportType = ((req.query.type as string) || 'MONTHLY').toUpperCase() as any;
      const csv = await ReportService.exportReportCsv(businessId, reportType);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="report_${reportType.toLowerCase()}.csv"`);
      return res.status(200).send(csv);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'CSV export failed', 500);
    }
  }
}

export default ReportController;

