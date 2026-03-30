package br.com.upfit.authservice.dto;

import br.com.upfit.authservice.model.ExperienceLevel;

public record UpdateProfileRequest(
        String photoUrl,
        String bio,
        Double weight,
        Double height,
        String goal,
        ExperienceLevel experienceLevel
) {}
