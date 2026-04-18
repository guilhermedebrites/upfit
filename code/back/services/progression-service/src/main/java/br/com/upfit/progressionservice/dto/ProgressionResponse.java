package br.com.upfit.progressionservice.dto;

import br.com.upfit.progressionservice.config.LevelThresholdService;
import br.com.upfit.progressionservice.model.Achievement;
import br.com.upfit.progressionservice.model.Progression;

import java.util.List;
import java.util.UUID;

public record ProgressionResponse(
        UUID id,
        UUID userId,
        int currentXp,
        int totalXp,
        int level,
        int streakDays,
        int xpToNextLevel,
        int currentLevelXpRequired,
        int nextLevelXpRequired,
        double progressPercent,
        List<AchievementResponse> achievements
) {
    public static ProgressionResponse from(
            Progression p,
            List<Achievement> achievements,
            List<LevelThresholdService.LevelThreshold> thresholds
    ) {
        int currentLevelXpRequired = thresholds.get(p.getLevel() - 1).xpRequired();
        int nextLevelXpRequired = (p.getLevel() < thresholds.size())
                ? thresholds.get(p.getLevel()).xpRequired()
                : currentLevelXpRequired;
        int xpToNextLevel = Math.max(0, nextLevelXpRequired - p.getTotalXp());
        double progressPercent = (nextLevelXpRequired > currentLevelXpRequired)
                ? Math.min(100.0, (double) (p.getTotalXp() - currentLevelXpRequired)
                        / (nextLevelXpRequired - currentLevelXpRequired) * 100.0)
                : 100.0;

        return new ProgressionResponse(
                p.getId(), p.getUserId(),
                p.getCurrentXp(), p.getTotalXp(),
                p.getLevel(), p.getStreakDays(),
                xpToNextLevel, currentLevelXpRequired, nextLevelXpRequired, progressPercent,
                achievements.stream().map(AchievementResponse::from).toList()
        );
    }
}
