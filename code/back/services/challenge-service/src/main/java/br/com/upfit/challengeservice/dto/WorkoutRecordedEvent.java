package br.com.upfit.challengeservice.dto;

public record WorkoutRecordedEvent(
        String eventType,
        String userId,
        String workoutId,
        String type,
        int durationMin,
        Double caloriesBurned,
        Double distanceKm
) {}
