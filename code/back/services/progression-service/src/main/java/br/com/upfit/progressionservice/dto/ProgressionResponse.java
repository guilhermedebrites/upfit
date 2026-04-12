package br.com.upfit.progressionservice.dto;

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
        List<AchievementResponse> achievements
) {
    public static ProgressionResponse from(Progression p, List<Achievement> achievements) {
        return new ProgressionResponse(
                p.getId(), p.getUserId(),
                p.getCurrentXp(), p.getTotalXp(),
                p.getLevel(), p.getStreakDays(),
                achievements.stream().map(AchievementResponse::from).toList()
        );
    }
}
