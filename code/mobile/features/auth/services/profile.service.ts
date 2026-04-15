import apiClient from '@/shared/api/client';
import type { AuthUser } from '../types/auth.types';
import { ExperienceLevel } from '@/shared/types/enums';

export interface UpdateProfileDto {
  name?:            string;
  experienceLevel?: ExperienceLevel;
  avatarUrl?:       string;
}

export const profileService = {
  async get(userId: string): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthUser>(`/profile/${userId}`);
    return data;
  },

  async update(userId: string, dto: UpdateProfileDto): Promise<AuthUser> {
    const { data } = await apiClient.put<AuthUser>(`/profile/${userId}`, dto);
    return data;
  },

  async getUploadUrl(filename: string): Promise<{ presignedUrl: string; objectUrl: string }> {
    const { data } = await apiClient.get<{ presignedUrl: string; objectUrl: string }>(
      `/profile/upload-url?filename=${encodeURIComponent(filename)}`,
    );
    return data;
  },

  async uploadToS3(presignedUrl: string, file: Blob): Promise<void> {
    await fetch(presignedUrl, { method: 'PUT', body: file });
  },
};
