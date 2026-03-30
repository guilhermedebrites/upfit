package br.com.upfit.workoutservice.dto;

import java.util.UUID;

public record WorkoutRecordedEvent(
        String eventType,
        UUID userId,
        UUID workoutId,
        String type,
        int durationMin,
        Double caloriesBurned
) {
    public WorkoutRecordedEvent(UUID userId, UUID workoutId, String type, int durationMin, Double caloriesBurned) {
        this("WorkoutRecorded", userId, workoutId, type, durationMin, caloriesBurned);
    }
}
