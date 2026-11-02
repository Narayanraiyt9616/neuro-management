import apiClient from './api';
import { IBillingCurrentStatus, ISubscriptionPlanItem } from '../types';

export const billingService = {
  async getCurrentStatus(): Promise<{ success: boolean; data: IBillingCurrentStatus }> {
    const res = await apiClient.get('/billing/current');
    return res as unknown as { success: boolean; data: IBillingCurrentStatus };
  },

  async getPlans(): Promise<{ success: boolean; data: ISubscriptionPlanItem[] }> {
    const res = await apiClient.get('/billing/plans');
    return res as unknown as { success: boolean; data: ISubscriptionPlanItem[] };
  },

  async subscribePlan(
    planCode: string,
    billingCycle: 'monthly' | 'annual' = 'monthly',
    paymentMethod: string = 'CARD'
  ): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await apiClient.post('/billing/subscribe', {
      planCode,
      billingCycle,
      paymentMethod
    });
    return res as unknown as { success: boolean; data: any; message?: string };
  },

  async changePlan(
    planCode: string,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await apiClient.post('/billing/change-plan', {
      planCode,
      billingCycle
    });
    return res as unknown as { success: boolean; data: any; message?: string };
  },

  async renewSubscription(): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await apiClient.post('/billing/renew');
    return res as unknown as { success: boolean; data: any; message?: string };
  },

  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post('/billing/cancel');
    return res as unknown as { success: boolean; message: string };
  },

  async getPaymentHistory(): Promise<{ success: boolean; data: any[] }> {
    const res = await apiClient.get('/billing/payments');
    return res as unknown as { success: boolean; data: any[] };
  },

  async triggerWebhookSimulation(payload: {
    event: string;
    paymentId: string;
    businessId: string;
    planCode: string;
    amount: number;
    currency: string;
    signature: string;
  }): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await apiClient.post('/billing/webhook', payload);
    return res as unknown as { success: boolean; data: any; message?: string };
  }
};

export default billingService;

