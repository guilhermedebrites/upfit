import apiClient from '@/shared/api/client';
import type { Challenge, CreateChallengeDto } from '../types/challenges.types';

export const challengesService = {
  async list(): Promise<Challenge[]> {
    const { data } = await apiClient.get<Challenge[]>('/challenges');
    return data;
  },

  /** Retorna desafios em que o usuário participa, com myParticipation preenchido */
  async listParticipating(): Promise<Challenge[]> {
    const { data } = await apiClient.get<Challenge[]>('/challenges?participating=true');
    return data;
  },

  async getById(id: string): Promise<Challenge> {
    const { data } = await apiClient.get<Challenge>(`/challenges/${id}`);
    return data;
  },

  async join(id: string, userLevel: number): Promise<void> {
    await apiClient.post(`/challenges/${id}/join`, { userLevel });
  },

  async leave(id: string): Promise<void> {
    await apiClient.delete(`/challenges/${id}/leave`);
  },

  // ADMIN only
  async create(dto: CreateChallengeDto): Promise<Challenge> {
    const { data } = await apiClient.post<Challenge>('/challenges', dto);
    return data;
  },

  async getUploadUrl(filename: string): Promise<{ presignedUrl: string; objectUrl: string }> {
    const { data } = await apiClient.get<{ presignedUrl: string; objectUrl: string }>(
      `/challenges/upload-url?filename=${encodeURIComponent(filename)}`,
    );
    return data;
  },
};
