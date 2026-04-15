export type WorkoutType = 'RUNNING' | 'STRENGTH';

export interface CreateWorkoutDto {
  type:         WorkoutType;
  durationMin:  number;
  notes?:       string;
  // Running
  distanceKm?:  number;
  // Strength
  exercises?:   ExerciseEntry[];
}

export interface ExerciseEntry {
  name:   string;
  sets:   number;
  reps:   number;
  weight: number;
}

export interface Workout {
  id:          string;
  userId:      string;
  type:        WorkoutType;
  durationMin: number;
  notes?:      string;
  distanceKm?: number;
  exercises?:  ExerciseEntry[];
  createdAt:   string;
}
