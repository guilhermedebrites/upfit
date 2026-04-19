import { ExperienceLevel, UserRole } from '@/shared/types/enums';

export interface RegisterDto {
  name:            string;
  email:           string;
  password:        string;
  experienceLevel: ExperienceLevel;
}

export interface LoginDto {
  email:    string;
  password: string;
}

/** Contrato real da API — campos retornados na raiz, sem objeto user aninhado */
export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  userId:       string;
  name:         string;
  email:        string;
}

export interface AuthUser {
  id:              string;
  name:            string;
  email:           string;
  role:            UserRole;
  experienceLevel: ExperienceLevel;
  avatarUrl?:      string;
}

export interface AuthState {
  user:         AuthUser | null;
  accessToken:  string | null;
  isLoading:    boolean;
  error:        string | null;
  isHydrated:   boolean;
}

export interface AuthActions {
  login:      (dto: LoginDto)           => Promise<void>;
  register:   (dto: RegisterDto)        => Promise<void>;
  logout:     ()                        => Promise<void>;
  hydrate:    ()                        => Promise<void>;
  clearError: ()                        => void;
  /** Atualiza campos parciais do usuário logado (ex: avatarUrl após upload) */
  patchUser:  (patch: Partial<AuthUser>) => void;
}
