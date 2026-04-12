package br.com.upfit.workoutservice.dto;

import br.com.upfit.workoutservice.model.ExerciseEntry;
import br.com.upfit.workoutservice.model.RunningWorkout;
import br.com.upfit.workoutservice.model.StrengthWorkout;
import br.com.upfit.workoutservice.model.Workout;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record WorkoutResponse(
        UUID id,
        UUID userId,
        String type,
        LocalDateTime dateTime,
        int durationMin,
        String notes,
        Double caloriesBurned,

        // RunningWorkout
        Double distanceKm,
        Double averagePace,

        // StrengthWorkout
        String primaryMuscleGroup,
        List<ExerciseEntryResponse> exercises
) {
    public record ExerciseEntryResponse(
            UUID id,
            String exerciseName,
            int sets,
            int reps,
            Double weight,
            int restSeconds
    ) {
        public static ExerciseEntryResponse from(ExerciseEntry e) {
            return new ExerciseEntryResponse(e.getId(), e.getExerciseName(), e.getSets(), e.getReps(), e.getWeight(), e.getRestSeconds());
        }
    }

    public static WorkoutResponse from(Workout workout) {
        if (workout instanceof RunningWorkout r) {
            return new WorkoutResponse(
                    r.getId(), r.getUserId(), "RUNNING", r.getDateTime(),
                    r.getDurationMin(), r.getNotes(), r.getCaloriesBurned(),
                    r.getDistanceKm(), r.getAveragePace(),
                    null, null
            );
        } else if (workout instanceof StrengthWorkout s) {
            return new WorkoutResponse(
                    s.getId(), s.getUserId(), "STRENGTH", s.getDateTime(),
                    s.getDurationMin(), s.getNotes(), s.getCaloriesBurned(),
                    null, null,
                    s.getPrimaryMuscleGroup(),
                    s.getExercises().stream().map(ExerciseEntryResponse::from).toList()
            );
        }
        throw new IllegalArgumentException("Tipo de treino desconhecido: " + workout.getClass().getSimpleName());
    }
}
