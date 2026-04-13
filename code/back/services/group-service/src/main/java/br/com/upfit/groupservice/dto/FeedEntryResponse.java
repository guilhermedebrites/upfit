package br.com.upfit.groupservice.dto;

import br.com.upfit.groupservice.model.GroupFeedEntry;

import java.time.LocalDateTime;
import java.util.UUID;

public record FeedEntryResponse(
        UUID id,
        UUID userId,
        UUID workoutId,
        String type,
        int durationMin,
        Double caloriesBurned,
        Double distanceKm,
        LocalDateTime recordedAt
) {
    public static FeedEntryResponse from(GroupFeedEntry e) {
        return new FeedEntryResponse(
                e.getId(),
                e.getUserId(),
                e.getWorkoutId(),
                e.getType(),
                e.getDurationMin(),
                e.getCaloriesBurned(),
                e.getDistanceKm(),
                e.getRecordedAt()
        );
    }
}
