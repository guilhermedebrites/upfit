import { GroupRole } from '@/shared/types/enums';

export interface Group {
  id:           string;
  name:         string;
  description:  string;
  imageUrl?:    string | null;
  weeklyGoal?:  string | null;
  groupXp?:     number;
  groupLevel?:  number;
  memberCount?: number;
  createdAt:    string;
}

/** Membro retornado por GET /groups/:id/members e GET /groups/:id/ranking */
export interface GroupMember {
  id:         string;
  userId:     string;
  role:       GroupRole;
  groupScore: number;
  joinedAt:   string;
}

export interface CreateGroupDto {
  name:         string;
  description:  string;
  weeklyGoal?:  string;
  imageUrl?:    string;
}
