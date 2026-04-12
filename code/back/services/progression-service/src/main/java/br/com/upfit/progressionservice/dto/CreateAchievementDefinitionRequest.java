package br.com.upfit.progressionservice.dto;

import br.com.upfit.progressionservice.model.AchievementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateAchievementDefinitionRequest(
        @NotBlank String title,
        String description,
        @NotNull AchievementType type,
        @NotBlank String rule,
        @NotNull @Positive Double threshold
) {}
