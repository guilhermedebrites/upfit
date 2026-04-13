package br.com.upfit.groupservice.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateGroupRequest(
        @NotBlank String name,
        String description,
        String imageUrl,
        String weeklyGoal
) {}
