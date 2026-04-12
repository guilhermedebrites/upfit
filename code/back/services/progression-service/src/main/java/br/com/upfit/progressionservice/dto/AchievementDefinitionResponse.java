package br.com.upfit.progressionservice.dto;

import br.com.upfit.progressionservice.model.AchievementDefinition;
import br.com.upfit.progressionservice.model.AchievementType;

import java.util.UUID;

public record AchievementDefinitionResponse(
        UUID id,
        String title,
        String description,
        AchievementType type,
        String rule,
        Double threshold,
        boolean active
) {
    public static AchievementDefinitionResponse from(AchievementDefinition d) {
        return new AchievementDefinitionResponse(
                d.getId(), d.getTitle(), d.getDescription(),
                d.getType(), d.getRule(), d.getThreshold(), d.isActive()
        );
    }
}
