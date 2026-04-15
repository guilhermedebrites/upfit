import apiClient from '@/shared/api/client';
import type { Progression } from '../types/progression.types';

export const progressionService = {
  async get(userId: string): Promise<Progression> {
    const { data } = await apiClient.get<Progression>(`/progression/${userId}`);
    return data;
  },
};
