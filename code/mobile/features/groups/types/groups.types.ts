import { GroupRole } from '@/shared/types/enums';

export interface Group {
  id:          string;
  name:        string;
  description: string;
  imageUrl?:   string;
  memberCount: number;
  createdAt:   string;
}

export interface GroupMember {
  userId:    string;
  name:      string;
  avatarUrl? :string;
  role:      GroupRole;
  xp:        number;
}

export interface CreateGroupDto {
  name:        string;
  description: string;
  imageUrl?:   string;
}
