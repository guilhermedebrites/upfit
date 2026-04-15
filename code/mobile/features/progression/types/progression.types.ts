import { AchievementType } from '@/shared/types/enums';

export interface Progression {
  userId:       string;
  level:        number;
  xp:           number;
  xpToNextLevel:number;
  streak:       number;
  achievements: Achievement[];
}

export interface Achievement {
  id:          string;
  name:        string;
  description: string;
  type:        AchievementType;
  iconUrl?:    string;
  unlockedAt:  string;
}
