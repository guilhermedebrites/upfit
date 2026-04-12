package br.com.upfit.progressionservice.messaging;

import br.com.upfit.progressionservice.dto.WorkoutRecordedEvent;
import br.com.upfit.progressionservice.service.ProgressionEngineService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.DeleteMessageRequest;
import software.amazon.awssdk.services.sqs.model.Message;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageResponse;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProgressionQueueListener {

    private final SqsClient sqsClient;
    private final ObjectMapper objectMapper;
    private final ProgressionEngineService progressionEngineService;

    @Value("${sqs.queue.progression-url}")
    private String queueUrl;

    @Scheduled(fixedDelay = 5000)
    public void poll() {
        ReceiveMessageResponse response = sqsClient.receiveMessage(
                ReceiveMessageRequest.builder()
                        .queueUrl(queueUrl)
                        .maxNumberOfMessages(10)
                        .waitTimeSeconds(5)
                        .build()
        );

        for (Message message : response.messages()) {
            try {
                String eventBody = extractEventBody(message.body());
                WorkoutRecordedEvent event = objectMapper.readValue(eventBody, WorkoutRecordedEvent.class);
                progressionEngineService.process(event);
                deleteMessage(message.receiptHandle());
            } catch (Exception e) {
                log.error("[progression-service] Erro ao processar mensagem: {}", e.getMessage(), e);
            }
        }
    }

    private String extractEventBody(String rawBody) {
        try {
            JsonNode node = objectMapper.readTree(rawBody);
            if (node.has("Message")) {
                return node.get("Message").asText();
            }
        } catch (Exception ignored) {}
        return rawBody;
    }

    private void deleteMessage(String receiptHandle) {
        sqsClient.deleteMessage(DeleteMessageRequest.builder()
                .queueUrl(queueUrl)
                .receiptHandle(receiptHandle)
                .build());
    }
}
