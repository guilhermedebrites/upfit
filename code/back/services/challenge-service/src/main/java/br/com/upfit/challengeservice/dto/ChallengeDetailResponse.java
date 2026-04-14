package br.com.upfit.challengeservice.dto;

import br.com.upfit.challengeservice.model.Challenge;
import br.com.upfit.challengeservice.model.ChallengeParticipation;
import br.com.upfit.challengeservice.model.ChallengeStatus;
import br.com.upfit.challengeservice.model.ChallengeType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ChallengeDetailResponse(
        UUID id,
        String title,
        String description,
        String goal,
        Double goalTarget,
        int rewardXp,
        LocalDate startDate,
        LocalDate endDate,
        ChallengeStatus status,
        ChallengeType type,
        Integer requiredLevel,
        String coverImageUrl,
        LocalDateTime createdAt,
        ParticipationResponse myParticipation
) {
    public static ChallengeDetailResponse from(Challenge c, ChallengeParticipation participation) {
        ParticipationResponse myParticipation = participation != null
                ? ParticipationResponse.from(participation, c.getGoalTarget())
                : null;
        return new ChallengeDetailResponse(
                c.getId(),
                c.getTitle(),
                c.getDescription(),
                c.getGoal(),
                c.getGoalTarget(),
                c.getRewardXp(),
                c.getStartDate(),
                c.getEndDate(),
                c.getStatus(),
                c.getType(),
                c.getRequiredLevel(),
                c.getCoverImageUrl(),
                c.getCreatedAt(),
                myParticipation
        );
    }
}
