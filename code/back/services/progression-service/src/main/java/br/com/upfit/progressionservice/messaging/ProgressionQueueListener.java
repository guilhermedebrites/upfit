package br.com.upfit.progressionservice.messaging;

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
                // SNS envelopa a mensagem — extrai o campo "Message" se presente
                String eventBody = extractEventBody(message.body());
                log.info("[progression-service] WorkoutRecorded recebido: {}", eventBody);
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
        } catch (Exception ignored) {
            // não é JSON de envelope SNS — usa o body direto
        }
        return rawBody;
    }

    private void deleteMessage(String receiptHandle) {
        sqsClient.deleteMessage(DeleteMessageRequest.builder()
                .queueUrl(queueUrl)
                .receiptHandle(receiptHandle)
                .build());
    }
}
