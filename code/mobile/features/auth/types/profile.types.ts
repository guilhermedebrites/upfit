import { ExperienceLevel } from '@/shared/types/enums';

/** Resposta de GET /profile/:userId */
export interface ProfileDto {
  id:              string;
  userId:          string;
  photoUrl?:       string | null;
  bio?:            string | null;
  weight?:         number | null;
  height?:         number | null;  // metros (ex: 1.80)
  goal?:           string | null;
  experienceLevel: ExperienceLevel;
}

/** Body de PUT /profile/:userId — todos opcionais */
export interface UpdateProfileDto {
  bio?:             string;
  weight?:          number;
  height?:          number;  // metros
  goal?:            string;
  experienceLevel?: ExperienceLevel;
  photoUrl?:        string;  // objectUrl retornado pelo upload S3
}
