import { Response, NextFunction } from 'express';
import PosService from '../services/posService';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';
import {
  openPosSessionSchema,
  closePosSessionSchema,
  cashAdjustmentSchema,
  posCheckoutSchema
} from '../validators/posValidator';

function extractBusinessId(req: IAuthRequest): string {
  const headerId = req.headers['x-business-id'] as string;
  const paramId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
  const queryId = req.query.businessId as string;
  const userBizId = req.user?.businessId;
  const bizId = headerId || paramId || queryId || userBizId;
  if (!bizId) throw new Error('Business identifier is required.');
  return Array.isArray(bizId) ? bizId[0] : bizId;
}

export class PosController {
  static async openSession(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const cashierId = req.user?.userId;
      if (!cashierId) return ApiResponse.error(res, 'User ID missing from session', 401);

      const validated = openPosSessionSchema.parse(req.body);
      const session = await PosService.openSession(businessId, cashierId, validated);
      return ApiResponse.created(res, session, 'POS session opened successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to open POS session', 400);
    }
  }

  static async getCurrentSession(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const cashierId = req.user?.userId;
      if (!cashierId) return ApiResponse.error(res, 'User ID missing', 401);

      const session = await PosService.getCurrentSession(businessId, cashierId);
      return ApiResponse.success(res, session, session ? 'Active session retrieved.' : 'No active session.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to get current session', 400);
    }
  }

  static async closeSession(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const cashierId = req.user?.userId;
      const sessionId = req.params.id as string;
      if (!cashierId) return ApiResponse.error(res, 'User ID missing', 401);

      const validated = closePosSessionSchema.parse(req.body);
      const session = await PosService.closeSession(businessId, sessionId, cashierId, validated);
      return ApiResponse.success(res, session, 'POS session closed and reconciled.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to close session', 400);
    }
  }

  static async adjustCash(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const cashierId = req.user?.userId;
      const sessionId = req.params.id as string;
      if (!cashierId) return ApiResponse.error(res, 'User ID missing', 401);

      const validated = cashAdjustmentSchema.parse(req.body);
      const session = await PosService.adjustCash(businessId, sessionId, cashierId, validated);
      return ApiResponse.success(res, session, 'Cash adjustment recorded.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to adjust cash', 400);
    }
  }

  static async searchCatalog(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const query = (req.query.q as string) || '';

      const items = await PosService.searchCatalog(businessId, query);
      return ApiResponse.success(res, items, 'Catalog search results.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to search catalog', 400);
    }
  }

  static async processCheckout(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const cashierId = req.user?.userId;
      if (!cashierId) return ApiResponse.error(res, 'User ID missing', 401);

      const validated = posCheckoutSchema.parse(req.body);
      const receipt = await PosService.processCheckout(businessId, cashierId, validated);
      return ApiResponse.created(res, receipt, 'Sale processed successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to process checkout', 400);
    }
  }

  static async holdCart(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.id as string;
      const { holdRef, customerName, items } = req.body;
      if (!items || !Array.isArray(items)) {
        return ApiResponse.error(res, 'Cart items required for hold', 400);
      }

      const held = PosService.holdCart(sessionId, { holdRef, customerName, items });
      return ApiResponse.success(res, held, 'Cart held successfully.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to hold cart', 400);
    }
  }

  static async getHeldCarts(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.id as string;
      const carts = PosService.getHeldCarts(sessionId);
      return ApiResponse.success(res, carts, 'Held carts retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to retrieve held carts', 400);
    }
  }

  static async removeHeldCart(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: sessionId, holdId } = req.params as { id: string; holdId: string };
      PosService.removeHeldCart(sessionId, holdId);
      return ApiResponse.success(res, { success: true }, 'Held cart cleared.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to clear held cart', 400);
    }
  }

  static async getZReport(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const sessionId = req.params.id as string;

      const report = await PosService.getZReport(businessId, sessionId);
      return ApiResponse.success(res, report, 'POS Z-Report generated.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to generate Z-Report', 404);
    }
  }
}

export default PosController;

