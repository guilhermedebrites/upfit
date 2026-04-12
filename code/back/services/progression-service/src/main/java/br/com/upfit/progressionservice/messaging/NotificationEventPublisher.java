package br.com.upfit.progressionservice.messaging;

import br.com.upfit.progressionservice.dto.WorkoutRecordedEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventPublisher {

    private final SnsClient snsClient;
    private final ObjectMapper objectMapper;

    @Value("${sns.topic.notification-arn}")
    private String notificationTopicArn;

    public void publishWorkoutRecorded(WorkoutRecordedEvent event) {
        publish("WorkoutRecorded", event);
    }

    public void publishLevelUp(UUID userId, int newLevel) {
        publish("LevelUp", Map.of("eventType", "LevelUp", "userId", userId.toString(), "newLevel", newLevel));
    }

    public void publishAchievementUnlocked(UUID userId, UUID achievementId) {
        publish("AchievementUnlocked", Map.of(
                "eventType", "AchievementUnlocked",
                "userId", userId.toString(),
                "achievementId", achievementId.toString()
        ));
    }

    private void publish(String subject, Object payload) {
        try {
            String message = objectMapper.writeValueAsString(payload);
            snsClient.publish(PublishRequest.builder()
                    .topicArn(notificationTopicArn)
                    .message(message)
                    .subject(subject)
                    .build());
            log.info("[progression-service] Evento {} publicado no NotificationTopic", subject);
        } catch (JsonProcessingException e) {
            log.error("[progression-service] Falha ao serializar evento {}: {}", subject, e.getMessage());
            throw new RuntimeException("Event serialization failed", e);
        }
    }
}
