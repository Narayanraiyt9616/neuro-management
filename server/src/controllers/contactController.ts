import { Request, Response, NextFunction } from 'express';
import ApiResponse from '../utils/apiResponse';
import logger from '../utils/logger';
import { validateContactForm } from '../validators/contactValidator';
import { IContactFormInput, IInquiryTicket } from '../types';

/**
 * Handle public contact and enterprise inquiry submissions
 */
export const submitContactForm = async (
  req: Request<unknown, unknown, IContactFormInput>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validation = validateContactForm(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation error in submitted form', 400, validation.errors);
    }

    const { name, email, subject, businessName, teamSize } = req.body;

    logger.info(`Received business inquiry from: ${email} (${businessName || 'Independent'}) - Subject: ${subject || 'General'}`);

    const inquiryTicket: IInquiryTicket = {
      referenceId: `BNX-INQ-${Date.now().toString(36).toUpperCase()}`,
      receivedAt: new Date().toISOString(),
      sender: {
        name: name.trim(),
        email: email.trim(),
        businessName: businessName ? businessName.trim() : null,
        teamSize: teamSize || 'Unspecified'
      },
      subject: subject ? subject.trim() : 'General Inquiry'
    };

    return ApiResponse.created<IInquiryTicket>(
      res,
      inquiryTicket,
      'Thank you! Your message has been received by our enterprise onboarding team.'
    );
  } catch (error) {
    next(error);
  }
};

export default {
  submitContactForm
};

