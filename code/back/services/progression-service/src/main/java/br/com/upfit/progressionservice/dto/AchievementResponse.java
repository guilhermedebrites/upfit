package br.com.upfit.progressionservice.dto;

import br.com.upfit.progressionservice.model.Achievement;

import java.time.LocalDateTime;
import java.util.UUID;

public record AchievementResponse(
        UUID id,
        UUID definitionId,
        String title,
        String description,
        LocalDateTime unlockedAt
) {
    public static AchievementResponse from(Achievement a) {
        return new AchievementResponse(
                a.getId(),
                a.getDefinition().getId(),
                a.getDefinition().getTitle(),
                a.getDefinition().getDescription(),
                a.getUnlockedAt()
        );
    }
}
