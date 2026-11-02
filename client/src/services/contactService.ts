import apiClient from './api';
import { IApiResponse, IContactFormData, IInquiryTicket } from '../types';

export const contactService = {
  /**
   * Submit contact or enterprise demo inquiry
   * @param formData Form input fields
   */
  async submitInquiry(formData: IContactFormData): Promise<IApiResponse<IInquiryTicket>> {
    return apiClient.post<unknown, IApiResponse<IInquiryTicket>>('/contact', formData);
  }
};

export default contactService;

