package br.com.upfit.groupservice.dto;

public record UpdateGroupRequest(
        String name,
        String description,
        String imageUrl,
        String weeklyGoal
) {}
