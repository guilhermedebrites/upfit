import apiClient from '@/shared/api/client';
import type { ProgressionDto } from '../types/progression.types';

export const progressionService = {
  async get(userId: string): Promise<ProgressionDto> {
    const { data } = await apiClient.get<ProgressionDto>(`/progression/${userId}`);
    return data;
  },
};
