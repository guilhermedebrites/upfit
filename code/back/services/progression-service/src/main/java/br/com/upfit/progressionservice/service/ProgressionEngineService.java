package br.com.upfit.progressionservice.service;

import br.com.upfit.progressionservice.config.LevelThresholdService;
import br.com.upfit.progressionservice.dto.WorkoutRecordedEvent;
import br.com.upfit.progressionservice.messaging.NotificationEventPublisher;
import br.com.upfit.progressionservice.model.Achievement;
import br.com.upfit.progressionservice.model.AchievementDefinition;
import br.com.upfit.progressionservice.model.Progression;
import br.com.upfit.progressionservice.repository.AchievementDefinitionRepository;
import br.com.upfit.progressionservice.repository.AchievementRepository;
import br.com.upfit.progressionservice.repository.ProgressionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressionEngineService {

    private final ProgressionRepository progressionRepository;
    private final AchievementDefinitionRepository definitionRepository;
    private final AchievementRepository achievementRepository;
    private final LevelThresholdService levelThresholdService;
    private final NotificationEventPublisher eventPublisher;

    @Transactional
    public void process(WorkoutRecordedEvent event) {
        Progression progression = progressionRepository
                .findByUserId(event.userId())
                .orElseGet(() -> progressionRepository.save(Progression.newFor(event.userId())));

        int xpEarned = calculateXp(event);
        int previousLevel = progression.getLevel();

        progression.setCurrentXp(progression.getCurrentXp() + xpEarned);
        progression.setTotalXp(progression.getTotalXp() + xpEarned);

        int newLevel = levelThresholdService.calculateLevel(progression.getTotalXp());
        progression.setLevel(newLevel);

        updateStreak(progression);

        progressionRepository.save(progression);

        log.info("[progression-service] userId={} xpEarned={} totalXp={} level={} streak={}",
                event.userId(), xpEarned, progression.getTotalXp(), newLevel, progression.getStreakDays());

        if (newLevel > previousLevel) {
            log.info("[progression-service] LevelUp! userId={} newLevel={}", event.userId(), newLevel);
            eventPublisher.publishLevelUp(event.userId(), newLevel);
        }

        evaluateAchievements(progression);

        eventPublisher.publishWorkoutRecorded(event);
    }

    private int calculateXp(WorkoutRecordedEvent event) {
        return switch (event.type().toUpperCase()) {
            case "RUNNING" -> {
                double km = event.distanceKm() != null ? event.distanceKm() : 0.0;
                yield (int) Math.round(km * 10);
            }
            case "STRENGTH" -> event.durationMin();
            default -> event.durationMin();
        };
    }

    private void updateStreak(Progression progression) {
        LocalDate today = LocalDate.now();
        LocalDate last = progression.getLastWorkoutDate();

        if (last == null) {
            progression.setStreakDays(1);
        } else if (last.equals(today)) {
            // já treinou hoje — não altera streak
        } else if (last.equals(today.minusDays(1))) {
            progression.setStreakDays(progression.getStreakDays() + 1);
        } else {
            progression.setStreakDays(1);
        }

        progression.setLastWorkoutDate(today);
    }

    private void evaluateAchievements(Progression progression) {
        List<AchievementDefinition> definitions = definitionRepository.findByActiveTrue();

        for (AchievementDefinition def : definitions) {
            if (achievementRepository.existsByProgressionIdAndDefinition(progression.getId(), def)) {
                continue;
            }

            if (ruleMatches(def, progression)) {
                Achievement achievement = new Achievement();
                achievement.setProgressionId(progression.getId());
                achievement.setDefinition(def);
                achievementRepository.save(achievement);

                log.info("[progression-service] AchievementUnlocked userId={} definitionId={}", progression.getUserId(), def.getId());
                eventPublisher.publishAchievementUnlocked(progression.getUserId(), achievement.getId());
            }
        }
    }

    private boolean ruleMatches(AchievementDefinition def, Progression progression) {
        String rule = def.getRule().toUpperCase();
        double threshold = def.getThreshold();

        if (rule.startsWith("STREAK_")) {
            return progression.getStreakDays() >= threshold;
        } else if (rule.startsWith("VOLUME_")) {
            return progression.getTotalXp() >= threshold;
        } else if (rule.startsWith("LEVEL_")) {
            return progression.getLevel() >= threshold;
        }

        log.warn("[progression-service] Regra desconhecida: {}", def.getRule());
        return false;
    }

    public Progression getByUserId(UUID userId) {
        return progressionRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Progression não encontrada para userId=" + userId));
    }

    public List<Achievement> getAchievementsByUserId(UUID userId) {
        return progressionRepository.findByUserId(userId)
                .map(p -> achievementRepository.findByProgressionId(p.getId()))
                .orElse(List.of());
    }
}
