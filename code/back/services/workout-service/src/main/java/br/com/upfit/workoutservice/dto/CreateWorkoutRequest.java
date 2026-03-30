package br.com.upfit.workoutservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;
import java.util.UUID;

public record CreateWorkoutRequest(
        @NotNull UUID userId,
        @NotBlank String type,           // "RUNNING" ou "STRENGTH"
        @Positive int durationMin,
        String notes,
        Double caloriesBurned,

        // --- campos de RunningWorkout ---
        Double distanceKm,
        Double averagePace,

        // --- campos de StrengthWorkout ---
        String primaryMuscleGroup,
        @Valid List<ExerciseEntryRequest> exercises
) {}
