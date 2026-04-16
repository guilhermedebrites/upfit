import { create } from 'zustand';
import { tokenStorage } from '@/shared/auth/token-storage';
import { parseApiError } from '@/shared/api/api-error';
import { authService } from '../services/auth.service';
import { ExperienceLevel, UserRole } from '@/shared/types/enums';
import type { AuthState, AuthActions, AuthUser, AuthResponse, LoginDto, RegisterDto } from '../types/auth.types';

// ─── JWT helpers ────────────────────────────────────────────────────────────

interface JwtPayload {
  sub:              string;
  email:            string;
  role?:            string;
  experienceLevel?: string;
  iat:              number;
  exp:              number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json   = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Constrói AuthUser combinando a resposta da API com o payload do JWT */
function buildUser(response: AuthResponse, token: string): AuthUser {
  const jwt = decodeJwtPayload(token);
  return {
    id:              response.userId,
    name:            response.name,
    email:           response.email,
    role:            (jwt?.role as UserRole)            ?? UserRole.USER,
    experienceLevel: (jwt?.experienceLevel as ExperienceLevel) ?? ExperienceLevel.BEGINNER,
  };
}

/** Reconstrói AuthUser mínimo a partir do JWT armazenado (sem nome — carregado pelo perfil depois) */
function buildUserFromJwt(token: string): AuthUser | null {
  const jwt = decodeJwtPayload(token);
  if (!jwt?.sub) return null;
  return {
    id:              jwt.sub,
    name:            '',
    email:           jwt.email,
    role:            (jwt.role as UserRole)            ?? UserRole.USER,
    experienceLevel: (jwt.experienceLevel as ExperienceLevel) ?? ExperienceLevel.BEGINNER,
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user:        null,
  accessToken: null,
  isLoading:   false,
  error:       null,
  isHydrated:  false,

  clearError: () => set({ error: null }),

  /** Reidrata sessão ao abrir o app */
  hydrate: async () => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      const user = buildUserFromJwt(token);
      set({ user, accessToken: token, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },

  login: async (dto: LoginDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(dto);
      const user     = buildUser(response, response.accessToken);
      await tokenStorage.setAccessToken(response.accessToken);
      await tokenStorage.setRefreshToken(response.refreshToken);
      set({ user, accessToken: response.accessToken, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
      throw err;
    }
  },

  register: async (dto: RegisterDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(dto);
      const user     = buildUser(response, response.accessToken);
      await tokenStorage.setAccessToken(response.accessToken);
      await tokenStorage.setRefreshToken(response.refreshToken);
      set({ user, accessToken: response.accessToken, isLoading: false });
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

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectUser       = (s: AuthStore) => s.user;
export const selectIsLoading  = (s: AuthStore) => s.isLoading;
export const selectAuthError  = (s: AuthStore) => s.error;
export const selectIsHydrated = (s: AuthStore) => s.isHydrated;
export const selectIsAdmin    = (s: AuthStore) => s.user?.role === UserRole.ADMIN;
