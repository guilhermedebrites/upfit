package br.com.upfit.workoutservice.dto;

import java.util.UUID;

public record WorkoutRecordedEvent(
        String eventType,
        UUID userId,
        UUID workoutId,
        String type,
        int durationMin,
        Double caloriesBurned,
        Double distanceKm
) {
    public WorkoutRecordedEvent(UUID userId, UUID workoutId, String type, int durationMin, Double caloriesBurned, Double distanceKm) {
        this("WorkoutRecorded", userId, workoutId, type, durationMin, caloriesBurned, distanceKm);
    }
}
