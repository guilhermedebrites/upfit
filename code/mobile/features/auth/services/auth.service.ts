import apiClient from '@/shared/api/client';
import { LoginDto, RegisterDto, AuthResponse } from '../types/auth.types';

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', dto);
    return data;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', dto);
    return data;
  },

  async refresh(refreshToken: string): Promise<Pick<AuthResponse, 'accessToken' | 'refreshToken'>> {
    const { data } = await apiClient.post<Pick<AuthResponse, 'accessToken' | 'refreshToken'>>(
      '/auth/refresh',
      { refreshToken },
    );
    return data;
  },
};
