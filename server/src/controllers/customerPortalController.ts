import { Response, NextFunction } from 'express';
import CustomerPortalService from '../services/customerPortalService';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';
import {
  createSupportTicketSchema,
  addTicketMessageSchema,
  quoteDecisionSchema,
  customerPayInvoiceSchema,
  updateCustomerProfileSchema
} from '../validators/customerPortalValidator';

function extractBusinessId(req: IAuthRequest): string {
  const headerId = req.headers['x-business-id'] as string;
  const paramId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
  const queryId = req.query.businessId as string;
  const userBizId = req.user?.businessId;
  const bizId = headerId || paramId || queryId || userBizId;
  if (!bizId) throw new Error('Business identifier is required.');
  return Array.isArray(bizId) ? bizId[0] : bizId;
}

export class CustomerPortalController {
  static async getDashboardStats(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const userId = req.user?.userId;
      if (!userId) return ApiResponse.error(res, 'User ID missing', 401);

      const customerId = await CustomerPortalService.resolveCustomerId(businessId, userId);
      const stats = await CustomerPortalService.getPortalStats(businessId, customerId);
      return ApiResponse.success(res, stats, 'Customer portal telemetry loaded.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to get portal stats', 400);
    }
  }

  static async getOrders(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const userId = req.user?.userId;
      if (!userId) return ApiResponse.error(res, 'User ID missing', 401);

      const customerId = await CustomerPortalService.resolveCustomerId(businessId, userId);
      const orders = await CustomerPortalService.getCustomerOrders(businessId, customerId);
      return ApiResponse.success(res, orders, 'Orders retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to retrieve orders', 400);
    }
  }

  static async getInvoices(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const userId = req.user?.userId;
      if (!userId) return ApiResponse.error(res, 'User ID missing', 401);

      const customerId = await CustomerPortalService.resolveCustomerId(businessId, userId);
      const invoices = await CustomerPortalService.getCustomerInvoices(businessId, customerId);
      return ApiResponse.success(res, invoices, 'Invoices retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to retrieve invoices', 400);
    }
  }

  static async payInvoice(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const userId = req.user?.userId;
      const invoiceId = req.params.id as string;
      if (!userId) return ApiResponse.error(res, 'User ID missing', 401);

      const validated = customerPayInvoiceSchema.parse(req.body);
      const customerId = await CustomerPortalService.resolveCustomerId(businessId, userId);
      const paymentResult = await CustomerPortalService.payInvoice(businessId, customerId, invoiceId, validated, userId);

      return ApiResponse.success(res, paymentResult, 'Invoice paid successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to process invoice payment', 400);
    }
  }

  static async decideQuote(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const userId = req.user?.userId;
      const quoteId = req.params.id as string;
      if (!userId) return ApiResponse.error(res, 'User ID missing', 401);

      const validated = quoteDecisionSchema.parse(req.body);
      const customerId = await CustomerPortalService.resolveCustomerId(businessId, userId);
      const decision = await CustomerPortalService.decideQuote(businessId, customerId, quoteId, validated, userId);

      return ApiResponse.success(res, decision, `Quote ${validated.decision.toLowerCase()}ed.`);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to record quote decision', 400);
    }
  }

  static async listTickets(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const userId = req.user?.userId;
      if (!userId) return ApiResponse.error(res, 'User ID missing', 401);

      const customerId = await CustomerPortalService.resolveCustomerId(businessId, userId);
      const tickets = await CustomerPortalService.listTickets(businessId, customerId);
      return ApiResponse.success(res, tickets, 'Tickets retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to retrieve tickets', 400);
    }
  }

  static async getTicketById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const ticketId = req.params.id as string;

      const ticket = await CustomerPortalService.getTicketById(businessId, ticketId);
      return ApiResponse.success(res, ticket, 'Ticket details retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Ticket not found', 404);
    }
  }

  static async createTicket(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const userId = req.user?.userId;
      const userName = req.user?.email || 'Customer';
      if (!userId) return ApiResponse.error(res, 'User ID missing', 401);

      const validated = createSupportTicketSchema.parse(req.body);
      const customerId = await CustomerPortalService.resolveCustomerId(businessId, userId);
      const ticket = await CustomerPortalService.createTicket(businessId, customerId, userId, userName, validated);

      return ApiResponse.created(res, ticket, 'Support ticket created.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to create support ticket', 400);
    }
  }

  static async replyTicket(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const userId = req.user?.userId;
      const userName = req.user?.email || 'Staff';
      const userRole = req.user?.role || 'CUSTOMER';
      const ticketId = req.params.id as string;
      if (!userId) return ApiResponse.error(res, 'User ID missing', 401);

      const validated = addTicketMessageSchema.parse(req.body);
      const ticket = await CustomerPortalService.addTicketMessage(
        businessId,
        ticketId,
        userId,
        userName,
        userRole,
        validated
      );

      return ApiResponse.success(res, ticket, 'Message posted to ticket.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to reply to ticket', 400);
    }
  }

  static async updateProfile(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const userId = req.user?.userId;
      if (!userId) return ApiResponse.error(res, 'User ID missing', 401);

      const validated = updateCustomerProfileSchema.parse(req.body);
      const customerId = await CustomerPortalService.resolveCustomerId(businessId, userId);
      const updated = await CustomerPortalService.updateProfile(businessId, customerId, validated);

      return ApiResponse.success(res, updated, 'Profile updated successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to update profile', 400);
    }
  }
}

export default CustomerPortalController;

