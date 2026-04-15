import { ChallengeStatus, ChallengeType } from '@/shared/types/enums';

export interface Challenge {
  id:          string;
  title:       string;
  description: string;
  type:        ChallengeType;
  status:      ChallengeStatus;
  imageUrl?:   string;
  startDate:   string;
  endDate:     string;
  goal:        number;
  unit:        string;
}

export interface ChallengeParticipant {
  userId:    string;
  name:      string;
  avatarUrl?:string;
  progress:  number;
}

export interface CreateChallengeDto {
  title:       string;
  description: string;
  type:        ChallengeType;
  startDate:   string;
  endDate:     string;
  goal:        number;
  unit:        string;
  imageUrl?:   string;
}
