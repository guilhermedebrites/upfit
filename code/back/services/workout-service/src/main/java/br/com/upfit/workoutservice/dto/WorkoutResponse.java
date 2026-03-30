package br.com.upfit.workoutservice.dto;

import br.com.upfit.workoutservice.model.RunningWorkout;
import br.com.upfit.workoutservice.model.Workout;

import java.time.LocalDateTime;
import java.util.UUID;

public record WorkoutResponse(
        UUID id,
        UUID userId,
        String type,
        LocalDateTime dateTime,
        int durationMin,
        String notes,
        Double caloriesBurned
) {
    public static WorkoutResponse from(Workout workout) {
        String type = workout instanceof RunningWorkout ? "RUNNING" : "STRENGTH";
        return new WorkoutResponse(
                workout.getId(),
                workout.getUserId(),
                type,
                workout.getDateTime(),
                workout.getDurationMin(),
                workout.getNotes(),
                workout.getCaloriesBurned()
        );
    }
}
