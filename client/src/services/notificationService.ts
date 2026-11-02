import apiClient from './api';

export interface INotificationItem {
  id: string;
  _id?: string;
  businessId: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  async getNotifications(unreadOnly: boolean = false): Promise<{ success: boolean; data: INotificationItem[] }> {
    const res = await apiClient.get('/notifications', {
      params: { unread: unreadOnly ? 'true' : 'false' }
    });
    return res as unknown as { success: boolean; data: INotificationItem[] };
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res as unknown as { success: boolean };
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    const res = await apiClient.patch('/notifications/read-all');
    return res as unknown as { success: boolean };
  }
};

export default notificationService;

