import { create } from 'zustand';
import { tokenStorage } from '@/shared/auth/token-storage';
import { parseApiError } from '@/shared/api/api-error';
import { authService } from '../services/auth.service';
import type { AuthState, AuthActions, AuthUser, LoginDto, RegisterDto } from '../types/auth.types';

// Decodifica o payload do JWT (sem verificar assinatura — validação é feita no backend)
function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json    = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as AuthUser;
  } catch {
    return null;
  }
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:        null,
  accessToken: null,
  isLoading:   false,
  error:       null,
  isHydrated:  false,

  clearError: () => set({ error: null }),

  // Reidrata sessão ao abrir o app
  hydrate: async () => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      const user = decodeJwtPayload(token);
      set({ user, accessToken: token, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },

  login: async (dto: LoginDto) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken, refreshToken, user } = await authService.login(dto);
      await tokenStorage.setAccessToken(accessToken);
      await tokenStorage.setRefreshToken(refreshToken);
      set({ user, accessToken, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
      throw err;
    }
  },

  register: async (dto: RegisterDto) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken, refreshToken, user } = await authService.register(dto);
      await tokenStorage.setAccessToken(accessToken);
      await tokenStorage.setRefreshToken(refreshToken);
      set({ user, accessToken, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await tokenStorage.clearTokens();
    set({ user: null, accessToken: null, error: null });
  },
}));

// Selector helpers
export const selectUser        = (s: AuthStore) => s.user;
export const selectIsLoading   = (s: AuthStore) => s.isLoading;
export const selectAuthError   = (s: AuthStore) => s.error;
export const selectIsHydrated  = (s: AuthStore) => s.isHydrated;
export const selectIsAdmin     = (s: AuthStore) => s.user?.role === 'ADMIN';
