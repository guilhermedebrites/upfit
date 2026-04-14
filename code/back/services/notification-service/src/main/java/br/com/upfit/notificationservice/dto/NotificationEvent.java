package br.com.upfit.notificationservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NotificationEvent(
        String eventType,
        // WorkoutRecorded, LevelUp, AchievementUnlocked, ChallengeCompleted, MemberJoined, MemberLeft
        String userId,
        // WorkoutRecorded
        String workoutId,
        String type,
        Integer durationMin,
        Double caloriesBurned,
        Double distanceKm,
        // LevelUp, GroupLevelUp
        Integer newLevel,
        // AchievementUnlocked
        String achievementId,
        String title,
        // ChallengeCompleted
        String challengeId,
        Integer rewardXp,
        // GroupLevelUp, MemberJoined, MemberLeft
        String groupId
) {}
