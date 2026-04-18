export type WorkoutType = 'RUNNING' | 'STRENGTH';

/** Resposta de GET /workouts/user/:id */
export interface WorkoutDto {
  id:                  string;
  type:                WorkoutType;
  dateTime:            string;       // ISO 8601
  durationMin:         number;
  caloriesBurned:      number;
  notes?:              string | null;
  // RUNNING
  distanceKm?:         number | null;
  averagePace?:        number | null;
  // STRENGTH
  primaryMuscleGroup?: string | null;
  exercises?:          ExerciseDto[];
}

export interface ExerciseDto {
  exerciseName: string;
  sets:         number;
  reps:         number;
  weight:       number;
  restSeconds:  number;
}

/** Request de POST /workouts */
export interface CreateWorkoutDto {
  type:                WorkoutType;
  durationMin:         number;
  caloriesBurned:      number;
  notes?:              string;
  // RUNNING
  distanceKm?:         number;
  averagePace?:        number;
  // STRENGTH
  primaryMuscleGroup?: string;
  exercises?:          CreateExerciseDto[];
}

export interface CreateExerciseDto {
  exerciseName: string;
  sets:         number;
  reps:         number;
  weight:       number;
  restSeconds:  number;
}
