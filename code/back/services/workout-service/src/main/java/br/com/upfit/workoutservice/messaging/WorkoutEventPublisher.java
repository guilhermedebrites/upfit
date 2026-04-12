package br.com.upfit.workoutservice.messaging;

import br.com.upfit.workoutservice.dto.WorkoutRecordedEvent;
import br.com.upfit.workoutservice.model.Workout;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkoutEventPublisher {

    private final SnsClient snsClient;
    private final ObjectMapper objectMapper;

    @Value("${sns.topic.workout-recorded-arn}")
    private String topicArn;

    public void publishWorkoutRecorded(Workout workout, String type) {
        Double distanceKm = (workout instanceof br.com.upfit.workoutservice.model.RunningWorkout r)
                ? r.getDistanceKm() : null;

        WorkoutRecordedEvent event = new WorkoutRecordedEvent(
                workout.getUserId(),
                workout.getId(),
                type,
                workout.getDurationMin(),
                workout.getCaloriesBurned(),
                distanceKm
        );

        try {
            String message = objectMapper.writeValueAsString(event);
            snsClient.publish(PublishRequest.builder()
                    .topicArn(topicArn)
                    .message(message)
                    .subject("WorkoutRecorded")
                    .build());
            log.info("[workout-service] WorkoutRecorded published — workoutId={} userId={}", workout.getId(), workout.getUserId());
        } catch (JsonProcessingException e) {
            log.error("[workout-service] Failed to serialize WorkoutRecordedEvent", e);
            throw new RuntimeException("Event serialization failed", e);
        }
    }
}
