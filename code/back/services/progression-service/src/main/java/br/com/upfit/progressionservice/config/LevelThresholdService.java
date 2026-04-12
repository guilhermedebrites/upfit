package br.com.upfit.progressionservice.config;

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
public class LevelThresholdService {

    private final S3Client s3Client;
    private final ObjectMapper objectMapper;

    @Value("${aws.s3.bucket.config:upfit-config}")
    private String configBucket;

    @Getter
    private List<LevelThreshold> thresholds = new ArrayList<>();

    @PostConstruct
    public void loadThresholds() {
        try {
            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(
                    GetObjectRequest.builder()
                            .bucket(configBucket)
                            .key("user-level-thresholds.json")
                            .build()
            );

            JsonNode root = objectMapper.readTree(s3Object);
            JsonNode thresholdsNode = root.get("thresholds");

            List<LevelThreshold> loaded = new ArrayList<>();
            for (JsonNode node : thresholdsNode) {
                loaded.add(new LevelThreshold(
                        node.get("level").asInt(),
                        node.get("xpRequired").asInt()
                ));
            }

            loaded.sort(Comparator.comparingInt(LevelThreshold::level));
            this.thresholds = loaded;
            log.info("[progression-service] Thresholds carregados do S3: {} níveis", thresholds.size());

        } catch (Exception e) {
            log.warn("[progression-service] Falha ao carregar thresholds do S3, usando fallback em memória. Causa: {}", e.getMessage());
            this.thresholds = defaultThresholds();
        }
    }

    public int calculateLevel(int totalXp) {
        int level = 1;
        for (LevelThreshold t : thresholds) {
            if (totalXp >= t.xpRequired()) {
                level = t.level();
            }
        }
        return level;
    }

    private List<LevelThreshold> defaultThresholds() {
        return List.of(
                new LevelThreshold(1, 0),
                new LevelThreshold(2, 100),
                new LevelThreshold(3, 250),
                new LevelThreshold(4, 500),
                new LevelThreshold(5, 900),
                new LevelThreshold(6, 1400),
                new LevelThreshold(7, 2000),
                new LevelThreshold(8, 2800),
                new LevelThreshold(9, 3800),
                new LevelThreshold(10, 5000)
        );
    }

    public record LevelThreshold(int level, int xpRequired) {}
}
