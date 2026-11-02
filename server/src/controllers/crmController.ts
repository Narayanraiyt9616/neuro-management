import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import CRMService from '../services/crmService';
import ApiResponse from '../utils/apiResponse';
import {
  customerInputSchema,
  customerUpdateSchema,
  leadInputSchema,
  leadUpdateSchema,
  leadConvertSchema,
  followUpInputSchema,
  followUpUpdateSchema,
  communicationInputSchema
} from '../validators/crmValidator';

export function extractBusinessId(req: IAuthRequest): string {
  const bizId =
    req.params.businessId ||
    (req.headers['x-business-id'] as string) ||
    (req.query.businessId as string) ||
    req.user?.businessId;

  if (!bizId) {
    throw new Error('Business context could not be identified. Please ensure you are authenticated into a business.');
  }
  return (Array.isArray(bizId) ? bizId[0] : bizId).toString();
}

function getParamId(req: IAuthRequest): string {
  const id = req.params.id;
  return (Array.isArray(id) ? id[0] : id) || '';
}

export class CRMController {
  /**
   * ============================================================================
   * MODULE 1: CUSTOMER MANAGEMENT
   * ============================================================================
   */

  static async listCustomers(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        customerType: req.query.customerType as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      };

      const result = await CRMService.listCustomers(businessId, filters);
      return ApiResponse.success(res, result, 'Customers retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getCustomerById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const customer = await CRMService.getCustomerById(businessId, getParamId(req));
      return ApiResponse.success(res, customer, 'Customer profile retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async createCustomer(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = customerInputSchema.parse(req.body);
      const customer = await CRMService.createCustomer(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, customer, 'Customer created successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateCustomer(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = customerUpdateSchema.parse(req.body);
      const customer = await CRMService.updateCustomer(businessId, getParamId(req), validated, req.user?.userId);
      return ApiResponse.success(res, customer, 'Customer profile updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteCustomer(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const result = await CRMService.deleteCustomer(businessId, getParamId(req), req.user?.userId);
      return ApiResponse.success(res, result, 'Customer removed successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async exportCustomers(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const csv = await CRMService.exportCustomersCSV(businessId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="customers-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }

  static async importCustomers(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      let csvContent = typeof req.body === 'string' ? req.body : req.body.csv;
      if (!csvContent && Array.isArray(req.body.rows)) {
        const header = 'Customer ID,Full Name,Email,Phone,Company Name,Customer Type';
        const lines = req.body.rows.map((r: any) =>
          `"${r.customerId || ''}","${r.fullName || r.name || ''}","${r.email || ''}","${r.phone || ''}","${r.companyName || ''}","${r.customerType || 'BUSINESS'}"`
        );
        csvContent = [header, ...lines].join('\n');
      }

      if (!csvContent) {
        return ApiResponse.error(res, 'Please provide csv string or rows array in request body.', 400);
      }

      const result = await CRMService.importCustomersCSV(businessId, csvContent, req.user?.userId);
      return ApiResponse.success(res, result, 'Customer records imported successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getCustomerTimeline(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const timeline = await CRMService.getCustomerTimeline(businessId, getParamId(req));
      return ApiResponse.success(res, timeline, 'Customer timeline retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 2: CRM LEAD MANAGEMENT & PIPELINE
   * ============================================================================
   */

  static async listLeads(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        status: req.query.status as any,
        source: req.query.source as any,
        assignedEmployeeId: req.query.assignedEmployeeId as string,
        search: req.query.search as string
      };

      const leads = await CRMService.listLeads(businessId, filters);
      return ApiResponse.success(res, leads, 'Leads retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async createLead(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = leadInputSchema.parse(req.body);
      const lead = await CRMService.createLead(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, lead, 'Sales lead created successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateLead(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = leadUpdateSchema.parse(req.body);
      const lead = await CRMService.updateLead(businessId, getParamId(req), validated, req.user?.userId);
      return ApiResponse.success(res, lead, 'Sales lead updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateLeadStatus(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const { status } = req.body;
      if (!['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'].includes(status)) {
        return ApiResponse.error(res, 'Invalid lead pipeline status.', 400);
      }
      const lead = await CRMService.updateLeadStatus(businessId, getParamId(req), status, req.user?.userId);
      return ApiResponse.success(res, lead, 'Lead pipeline status updated.');
    } catch (err) {
      next(err);
    }
  }

  static async convertLead(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = leadConvertSchema.parse(req.body);
      const result = await CRMService.convertLead(businessId, getParamId(req), validated, req.user?.userId);
      return ApiResponse.success(res, result, 'Lead converted into customer successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteLead(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const result = await CRMService.deleteLead(businessId, getParamId(req), req.user?.userId);
      return ApiResponse.success(res, result, 'Sales lead deleted.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 3: FOLLOW-UP MANAGEMENT & CALENDAR
   * ============================================================================
   */

  static async listFollowUps(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        status: req.query.status as string,
        leadId: req.query.leadId as string,
        customerId: req.query.customerId as string,
        assignedEmployeeId: req.query.assignedEmployeeId as string
      };

      const followUps = await CRMService.listFollowUps(businessId, filters);
      return ApiResponse.success(res, followUps, 'Follow-ups retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async createFollowUp(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = followUpInputSchema.parse(req.body);
      const followUp = await CRMService.createFollowUp(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, followUp, 'Follow-up scheduled successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateFollowUp(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = followUpUpdateSchema.parse(req.body);
      const followUp = await CRMService.updateFollowUp(businessId, getParamId(req), validated, req.user?.userId);
      return ApiResponse.success(res, followUp, 'Follow-up updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteFollowUp(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const result = await CRMService.deleteFollowUp(businessId, getParamId(req), req.user?.userId);
      return ApiResponse.success(res, result, 'Follow-up deleted.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 7: CUSTOMER COMMUNICATION & LOGGING
   * ============================================================================
   */

  static async recordCommunication(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = communicationInputSchema.parse(req.body);
      const result = await CRMService.recordCommunication(businessId, validated, req.user?.userId);
      return ApiResponse.created(res, result, 'Communication logged and dispatched successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getCommunicationHistory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const history = await CRMService.getCommunicationHistory(
        businessId,
        req.query.customerId as string,
        req.query.leadId as string
      );
      return ApiResponse.success(res, history, 'Communication history retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export default CRMController;
