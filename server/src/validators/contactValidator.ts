import { IContactFormInput, IValidationResult, IValidationError } from '../types';

/**
 * Validation rules for contact inquiry submission
 */
export const validateContactForm = (body: Partial<IContactFormInput>): IValidationResult => {
  const errors: IValidationError[] = [];
  const { name, email, message } = body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name is required (at least 2 characters)' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Message is required (at least 10 characters)' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateContactForm
};

