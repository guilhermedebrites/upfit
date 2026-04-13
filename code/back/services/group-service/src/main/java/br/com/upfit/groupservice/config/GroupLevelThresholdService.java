package br.com.upfit.groupservice.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupLevelThresholdService {

    private final S3Client s3Client;
    private final ObjectMapper objectMapper;

    @Value("${aws.s3.bucket.config:upfit-config}")
    private String configBucket;

    @Getter
    private List<GroupLevelThreshold> thresholds = new ArrayList<>();

    @PostConstruct
    public void loadThresholds() {
        try {
            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(
                    GetObjectRequest.builder()
                            .bucket(configBucket)
                            .key("group-level-thresholds.json")
                            .build()
            );

            JsonNode root = objectMapper.readTree(s3Object);
            JsonNode thresholdsNode = root.get("thresholds");

            List<GroupLevelThreshold> loaded = new ArrayList<>();
            for (JsonNode node : thresholdsNode) {
                loaded.add(new GroupLevelThreshold(
                        node.get("level").asInt(),
                        node.get("groupXpRequired").asInt()
                ));
            }

            loaded.sort(Comparator.comparingInt(GroupLevelThreshold::level));
            this.thresholds = loaded;
            log.info("[group-service] Thresholds carregados do S3: {} níveis", thresholds.size());

        } catch (Exception e) {
            log.warn("[group-service] Falha ao carregar thresholds do S3, usando fallback em memória. Causa: {}", e.getMessage());
            this.thresholds = defaultThresholds();
        }
    }

    public int calculateLevel(int totalXp) {
        int level = 1;
        for (GroupLevelThreshold t : thresholds) {
            if (totalXp >= t.groupXpRequired()) {
                level = t.level();
            }
        }
        return level;
    }

    private List<GroupLevelThreshold> defaultThresholds() {
        return List.of(
                new GroupLevelThreshold(1, 0),
                new GroupLevelThreshold(2, 500),
                new GroupLevelThreshold(3, 1200),
                new GroupLevelThreshold(4, 2500),
                new GroupLevelThreshold(5, 4500),
                new GroupLevelThreshold(6, 7000),
                new GroupLevelThreshold(7, 10000),
                new GroupLevelThreshold(8, 14000),
                new GroupLevelThreshold(9, 19000),
                new GroupLevelThreshold(10, 25000)
        );
    }

    public record GroupLevelThreshold(int level, int groupXpRequired) {}
}
