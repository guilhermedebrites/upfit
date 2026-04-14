package br.com.upfit.challengeservice.dto;

import br.com.upfit.challengeservice.model.ChallengeParticipation;

import java.time.LocalDateTime;
import java.util.UUID;

public record ParticipationResponse(
        UUID id,
        UUID challengeId,
        Double currentProgress,
        Boolean completed,
        LocalDateTime completedAt,
        LocalDateTime joinedAt,
        Double progressPercent
) {
    public static ParticipationResponse from(ChallengeParticipation p, Double goalTarget) {
        double percent = (goalTarget != null && goalTarget > 0)
                ? Math.min(100.0, (p.getCurrentProgress() / goalTarget) * 100.0)
                : 0.0;
        return new ParticipationResponse(
                p.getId(),
                p.getChallengeId(),
                p.getCurrentProgress(),
                p.getCompleted(),
                p.getCompletedAt(),
                p.getJoinedAt(),
                Math.round(percent * 100.0) / 100.0
        );
    }
}
