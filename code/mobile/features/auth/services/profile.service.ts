import { Platform } from 'react-native';
import apiClient from '@/shared/api/client';
import type { ProfileDto, UpdateProfileDto } from '../types/profile.types';

/**
 * Em dev local o backend devolve http://localstack:4566/... (hostname interno do Docker).
 * - iOS Simulator  → troca por localhost:4566
 * - Android Emulator → troca por 10.0.2.2:4566  (localhost = emulador, não o host)
 */
/**
 * Normaliza uma URL do S3 para exibição/acesso na plataforma atual.
 * Nunca deve ser usada para URLs que serão salvas no banco —
 * o banco deve sempre receber a URL canônica (localstack:4566).
 *
 * localstack:4566  → localhost:4566   (iOS Simulator / web)
 * localstack:4566  → 10.0.2.2:4566   (Android Emulator)
 * localhost:4566   → 10.0.2.2:4566   (Android — URLs antigas salvas pelo iOS)
 */
function normalizeS3Url(url: string): string {
  // 1. Canonicaliza o hostname interno do Docker
  let out = url.replace('localstack:4566', 'localhost:4566');
  // 2. No Android, localhost não alcança o host Mac
  if (Platform.OS === 'android') {
    out = out.replace('localhost:4566', '10.0.2.2:4566');
  }
  return out;
}

export const profileService = {
  async get(userId: string): Promise<ProfileDto> {
    const { data } = await apiClient.get<ProfileDto>(`/profile/${userId}`);
    if (data.photoUrl) {
      data.photoUrl = normalizeS3Url(data.photoUrl);
    }
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
    // presignedUrl → normaliza para a plataforma atual (usado só para o PUT ao S3)
    // objectUrl    → mantém como localstack:4566 para ser salvo no banco de forma canônica;
    //                a normalização para exibição ocorre em profileService.get()
    const presignedUrl = normalizeS3Url(data.presignedUrl);
    const objectUrl    = data.objectUrl;
    return { presignedUrl, objectUrl };
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
