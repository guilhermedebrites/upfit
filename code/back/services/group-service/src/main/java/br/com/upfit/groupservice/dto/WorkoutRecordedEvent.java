package br.com.upfit.groupservice.dto;

import java.util.UUID;

public record WorkoutRecordedEvent(
        String eventType,
        UUID userId,
        UUID workoutId,
        String type,
        int durationMin,
        Double caloriesBurned,
        Double distanceKm
) {}
