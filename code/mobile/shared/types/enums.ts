export enum ExperienceLevel {
  BEGINNER     = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED     = 'ADVANCED',
}

export enum UserRole {
  USER  = 'USER',
  ADMIN = 'ADMIN',
}

export enum GroupRole {
  MEMBER = 'MEMBER',
  ADMIN  = 'ADMIN',
  OWNER  = 'OWNER',
}

export enum NotificationType {
  WORKOUT     = 'WORKOUT',
  LEVEL_UP    = 'LEVEL_UP',
  ACHIEVEMENT = 'ACHIEVEMENT',
  CHALLENGE   = 'CHALLENGE',
  GROUP       = 'GROUP',
}

export enum AchievementType {
  CONSISTENCY = 'CONSISTENCY',
  VOLUME      = 'VOLUME',
  SPEED       = 'SPEED',
  STRENGTH    = 'STRENGTH',
  SOCIAL      = 'SOCIAL',
}

export enum ChallengeStatus {
  ACTIVE    = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED   = 'EXPIRED',
}

export enum ChallengeType {
  GLOBAL = 'GLOBAL',
  DAILY  = 'DAILY',
  WEEKLY = 'WEEKLY',
}
