import { GroupRole } from '@/shared/types/enums';

export interface Group {
  id:                      string;
  name:                    string;
  description:             string;
  imageUrl?:               string | null;
  weeklyGoal?:             string | null;
  groupXp?:                number;
  groupLevel?:             number;
  memberCount?:            number;
  // Campos extras retornados por GET /groups/:id
  xpToNextLevel?:          number;
  currentLevelXpRequired?: number;
  nextLevelXpRequired?:    number;
  progressPercent?:        number;
  createdAt:               string;
}

/** Membro retornado por GET /groups/:id/members e GET /groups/:id/ranking */
export interface GroupMember {
  id:         string;
  userId:     string;
  role:       GroupRole;
  groupScore: number;
  joinedAt:   string;
}

/** Item retornado por GET /groups/:id/feed */
export interface GroupFeedItem {
  id:             string;
  userId:         string;
  workoutId:      string;
  type:           'RUNNING' | 'STRENGTH';
  durationMin:    number;
  caloriesBurned: number;
  distanceKm?:    number | null;
  averagePace?:   number | null;
  primaryMuscle?: string | null;
  recordedAt:     string;
}

export interface CreateGroupDto {
  name:         string;
  description:  string;
  weeklyGoal?:  string;
  imageUrl?:    string;
}
