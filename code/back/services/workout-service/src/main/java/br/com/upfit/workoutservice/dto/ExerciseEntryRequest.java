package br.com.upfit.workoutservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ExerciseEntryRequest(
        @NotBlank String exerciseName,
        @Positive int sets,
        @Positive int reps,
        Double weight,
        int restSeconds
) {}
