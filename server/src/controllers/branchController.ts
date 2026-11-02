import { Response, NextFunction } from 'express';
import BranchService from '../services/branchService';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';
import {
  branchCreateSchema,
  branchUpdateSchema,
  branchTransferSchema
} from '../validators/branchValidator';

function extractBusinessId(req: IAuthRequest): string {
  const headerId = req.headers['x-business-id'] as string;
  const paramId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
  const queryId = req.query.businessId as string;
  const userBizId = req.user?.businessId;
  const bizId = headerId || paramId || queryId || userBizId;
  if (!bizId) throw new Error('Business identifier is required.');
  return Array.isArray(bizId) ? bizId[0] : bizId;
}

export class BranchController {
  static async createBranch(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = branchCreateSchema.parse(req.body);
      const actorUserId = req.user?.userId;

      const branch = await BranchService.createBranch(businessId, validated, actorUserId);
      return ApiResponse.created(res, branch, 'Branch created successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to create branch', 400);
    }
  }

  static async getBranches(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const { search, type, status, page, limit } = req.query;

      const result = await BranchService.getBranches(businessId, {
        search: search as string,
        type: type as string,
        status: status as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined
      });

      return ApiResponse.success(res, result, 'Branches retrieved successfully.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to list branches', 500);
    }
  }

  static async getBranchById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const branchId = req.params.id as string;

      const branch = await BranchService.getBranchById(businessId, branchId);
      return ApiResponse.success(res, branch, 'Branch retrieved successfully.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Branch not found', 404);
    }
  }

  static async updateBranch(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const branchId = req.params.id as string;
      const validated = branchUpdateSchema.parse(req.body);
      const actorUserId = req.user?.userId;

      const updated = await BranchService.updateBranch(businessId, branchId, validated, actorUserId);
      return ApiResponse.success(res, updated, 'Branch updated successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to update branch', 400);
    }
  }

  static async deleteBranch(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const branchId = req.params.id as string;
      const actorUserId = req.user?.userId;

      const result = await BranchService.deleteBranch(businessId, branchId, actorUserId);
      return ApiResponse.success(res, result, result.message);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to delete branch', 400);
    }
  }

  static async getBranchAnalytics(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const branchId = req.params.id as string;

      const analytics = await BranchService.getBranchAnalytics(businessId, branchId);
      return ApiResponse.success(res, analytics, 'Branch analytics calculated.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to get branch analytics', 404);
    }
  }

  static async transferStock(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = branchTransferSchema.parse(req.body);
      const actorUserId = req.user?.userId;

      const transfer = await BranchService.transferStockBetweenBranches(businessId, validated, actorUserId);
      return ApiResponse.success(res, transfer, 'Inter-branch stock transfer completed.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to transfer stock', 400);
    }
  }
}

export default BranchController;

