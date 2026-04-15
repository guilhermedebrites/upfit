import apiClient from '@/shared/api/client';
import type { Notification } from '../types/notifications.types';

export const notificationsService = {
  async list(userId: string, all = false): Promise<Notification[]> {
    const { data } = await apiClient.get<Notification[]>(
      `/notifications/${userId}${all ? '?all=true' : ''}`,
    );
    return data;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },
};
