import { ChallengeStatus, ChallengeType } from '@/shared/types/enums';

export interface MyParticipation {
  currentProgress: number;
  completed:       boolean;
  progressPercent: number;
}

export interface Challenge {
  id:             string;
  title:          string;
  description:    string;
  goal:           string;        // ex: "Acumule 10km de corrida"
  goalTarget:     number;
  rewardXp:       number;
  type:           ChallengeType;
  status:         ChallengeStatus;
  startDate:      string;
  endDate:        string;
  requiredLevel:  number | null;
  coverImageUrl?: string | null;
  myParticipation?: MyParticipation | null;
}

export interface CreateChallengeDto {
  title:          string;
  description:    string;
  goal:           string;
  goalTarget:     number;
  rewardXp:       number;
  type:           ChallengeType;
  startDate:      string;
  endDate:        string;
  requiredLevel?: number | null;
  coverImageUrl?: string | null;
}
