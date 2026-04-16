import apiClient from '@/shared/api/client';
import type { ProfileDto, UpdateProfileDto } from '../types/profile.types';

export const profileService = {
  async get(userId: string): Promise<ProfileDto> {
    const { data } = await apiClient.get<ProfileDto>(`/profile/${userId}`);
    return data;
  },

  async update(userId: string, dto: UpdateProfileDto): Promise<ProfileDto> {
    const { data } = await apiClient.put<ProfileDto>(`/profile/${userId}`, dto);
    return data;
  },

  async getUploadUrl(filename: string): Promise<{ presignedUrl: string; objectUrl: string }> {
    const { data } = await apiClient.get<{ presignedUrl: string; objectUrl: string }>(
      `/profile/upload-url?filename=${encodeURIComponent(filename)}`,
    );
    return data;
  },

  /** PUT direto no S3 com a presigned URL */
  async uploadToS3(presignedUrl: string, file: Blob): Promise<void> {
    await fetch(presignedUrl, {
      method:  'PUT',
      body:    file,
      headers: { 'Content-Type': file.type || 'image/jpeg' },
    });
  },
};
