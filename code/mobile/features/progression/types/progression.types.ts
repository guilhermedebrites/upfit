import { AchievementType } from '@/shared/types/enums';

/** Resposta de GET /progression/:userId */
export interface ProgressionDto {
  id:                      string;
  userId:                  string;
  currentXp:               number;  // XP total acumulado
  totalXp:                 number;
  level:                   number;
  streakDays:              number;
  xpToNextLevel:           number;  // XP restante para o próximo nível
  currentLevelXpRequired:  number;  // XP mínimo para atingir o nível atual
  nextLevelXpRequired:     number;  // XP necessário para o próximo nível
  progressPercent:         number;  // % de progresso dentro do nível atual
  achievements:            AchievementDto[];
}

export interface AchievementDto {
  id:           string;
  definitionId: string;
  title:        string;
  description:  string;
  unlockedAt:   string;
}
