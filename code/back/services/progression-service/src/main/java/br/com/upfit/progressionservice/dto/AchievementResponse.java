package br.com.upfit.progressionservice.dto;

import br.com.upfit.progressionservice.model.Achievement;
import br.com.upfit.progressionservice.model.AchievementType;

import java.time.LocalDateTime;
import java.util.UUID;

public record AchievementResponse(
        UUID id,
        UUID definitionId,
        String title,
        String description,
        AchievementType type,
        LocalDateTime unlockedAt
) {
    public static AchievementResponse from(Achievement a) {
        return new AchievementResponse(
                a.getId(),
                a.getDefinition().getId(),
                a.getDefinition().getTitle(),
                a.getDefinition().getDescription(),
                a.getDefinition().getType(),
                a.getUnlockedAt()
        );
    }
}
