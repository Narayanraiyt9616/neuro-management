import { Response, NextFunction } from 'express';
import BillingService from '../services/billingService';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';
import { subscriptionPurchaseSchema, webhookPayloadSchema } from '../validators/billingValidator';

function extractBusinessId(req: IAuthRequest): string {
  const headerId = req.headers['x-business-id'] as string;
  const paramId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
  const queryId = req.query.businessId as string;
  const userBizId = req.user?.businessId;
  const bizId = headerId || paramId || queryId || userBizId;
  if (!bizId) throw new Error('Business identifier is required.');
  return Array.isArray(bizId) ? bizId[0] : bizId;
}

export class BillingController {
  static async getCurrentStatus(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const status = await BillingService.getCurrentStatus(businessId);
      return ApiResponse.success(res, status, 'Current billing status retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to retrieve billing status', 500);
    }
  }

  static async getPlans(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const plans = await BillingService.getAvailablePlans();
      return ApiResponse.success(res, plans, 'Available plans retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to load plans', 500);
    }
  }

  static async subscribePlan(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = subscriptionPurchaseSchema.parse(req.body);
      const sub = await BillingService.subscribePlan(
        businessId,
        validated.planCode,
        validated.billingCycle,
        validated.paymentMethod || 'CREDIT_CARD'
      );
      return ApiResponse.success(res, sub, `Successfully subscribed to ${validated.planCode} plan.`);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Subscription failed', 400);
    }
  }

  static async changePlan(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = subscriptionPurchaseSchema.parse(req.body);
      const sub = await BillingService.changePlan(businessId, validated.planCode, validated.billingCycle);
      return ApiResponse.success(res, sub, `Plan successfully updated to ${validated.planCode}.`);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Plan migration failed', 400);
    }
  }

  static async renewSubscription(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const sub = await BillingService.renewSubscription(businessId);
      return ApiResponse.success(res, sub, 'Subscription successfully renewed.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Renewal failed', 400);
    }
  }

  static async cancelSubscription(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const result = await BillingService.cancelSubscription(businessId);
      return ApiResponse.success(res, result, 'Subscription auto-renew canceled.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Cancellation failed', 400);
    }
  }

  static async getPaymentHistory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const history = await BillingService.getPaymentHistory(businessId);
      return ApiResponse.success(res, history, 'Payment history retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to retrieve payment history', 500);
    }
  }

  /**
   * Verified Gateway Webhook
   */
  static async handleWebhook(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const signature = (req.headers['x-webhook-signature'] as string) || req.body.signature;
      const payload = webhookPayloadSchema.parse({
        ...req.body,
        signature: signature || req.body.signature
      });

      const result = await BillingService.handlePaymentWebhook(payload);
      return ApiResponse.success(res, result, 'Webhook verified and processed.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Webhook verification failed', 400);
    }
  }
}

export default BillingController;

