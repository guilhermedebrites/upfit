package br.com.upfit.challengeservice.dto;

import br.com.upfit.challengeservice.model.ChallengeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record CreateChallengeRequest(
        @NotBlank String title,
        String description,
        @NotBlank String goal,
        @NotNull @Positive Double goalTarget,
        @NotNull @Positive int rewardXp,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull ChallengeType type,
        Integer requiredLevel,
        String coverImageUrl
) {}
