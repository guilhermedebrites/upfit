package br.com.upfit.groupservice.dto;

import br.com.upfit.groupservice.model.Group;

import java.time.LocalDateTime;
import java.util.UUID;

public record GroupDetailResponse(
        UUID id,
        String name,
        String description,
        String imageUrl,
        LocalDateTime createdAt,
        String weeklyGoal,
        int groupXp,
        int groupLevel,
        int xpToNextLevel,
        int currentLevelXpRequired,
        int nextLevelXpRequired,
        int progressPercent
) {
    public static GroupDetailResponse from(Group g, int currentLevelXpRequired, int nextLevelXpRequired) {
        int xpSinceCurrentLevel = g.getGroupXp() - currentLevelXpRequired;
        int xpNeededForNextLevel = nextLevelXpRequired - currentLevelXpRequired;
        int progressPercent = xpNeededForNextLevel > 0
                ? (int) Math.min(100, Math.round((double) xpSinceCurrentLevel / xpNeededForNextLevel * 100))
                : 100;
        int xpToNextLevel = Math.max(0, nextLevelXpRequired - g.getGroupXp());

        return new GroupDetailResponse(
                g.getId(),
                g.getName(),
                g.getDescription(),
                g.getImageUrl(),
                g.getCreatedAt(),
                g.getWeeklyGoal(),
                g.getGroupXp(),
                g.getGroupLevel(),
                xpToNextLevel,
                currentLevelXpRequired,
                nextLevelXpRequired,
                progressPercent
        );
    }
}
