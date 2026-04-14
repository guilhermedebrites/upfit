package br.com.upfit.challengeservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record JoinChallengeRequest(
        @NotNull @Min(1) int userLevel
) {}
