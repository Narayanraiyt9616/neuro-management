import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import ApiResponse from '../utils/apiResponse';
import adminService from '../services/adminService';
import { businessRegistrationSchema } from '../validators/businessValidator';

/**
 * Handle public / owner business registration
 * Business is placed in PENDING status for Super Admin review
 */
export const registerBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validatedData = businessRegistrationSchema.parse(req.body);
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || undefined;

    const business = await adminService.registerBusiness(validatedData, clientIp);

    return ApiResponse.created(
      res,
      business,
      `Registration application for '${business.name}' submitted successfully. Your account is currently PENDING review by the platform administrator.`
    );
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return ApiResponse.error(
        res,
        'Validation error in business registration details.',
        400,
        err.issues
      );
    }
    next(err);
  }
};

export default {
  registerBusiness
};

