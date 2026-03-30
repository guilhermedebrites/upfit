package br.com.upfit.authservice.dto;

import br.com.upfit.authservice.model.ExperienceLevel;
import br.com.upfit.authservice.model.Profile;

import java.util.UUID;

public record ProfileResponse(
        UUID id,
        UUID userId,
        String photoUrl,
        String bio,
        Double weight,
        Double height,
        String goal,
        ExperienceLevel experienceLevel
) {
    public static ProfileResponse from(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getPhotoUrl(),
                profile.getBio(),
                profile.getWeight(),
                profile.getHeight(),
                profile.getGoal(),
                profile.getExperienceLevel()
        );
    }
}
