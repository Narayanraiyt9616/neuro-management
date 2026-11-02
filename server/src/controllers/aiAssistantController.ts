import { Response, NextFunction } from 'express';
import AiAssistantService from '../services/aiAssistantService';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';
import { aiQuerySchema } from '../validators/aiValidator';

function extractBusinessId(req: IAuthRequest): string {
  const headerId = req.headers['x-business-id'] as string;
  const paramId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
  const queryId = req.query.businessId as string;
  const userBizId = req.user?.businessId;
  const bizId = headerId || paramId || queryId || userBizId;
  if (!bizId) throw new Error('Business identifier is required.');
  return Array.isArray(bizId) ? bizId[0] : bizId;
}

export class AiAssistantController {
  static async askQuestion(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = aiQuerySchema.parse(req.body);
      const answer = await AiAssistantService.askAssistant(businessId, validated.question);
      return ApiResponse.success(res, answer, 'AI query processed successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'AI Assistant processing failed', 400);
    }
  }

  static async getInsights(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const insights = await AiAssistantService.getBusinessInsights(businessId);
      return ApiResponse.success(res, insights, 'AI business insights retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to generate insights', 500);
    }
  }
}

export default AiAssistantController;

