package br.com.upfit.challengeservice.service;

import br.com.upfit.challengeservice.dto.*;
import br.com.upfit.challengeservice.messaging.NotificationEventPublisher;
import br.com.upfit.challengeservice.model.Challenge;
import br.com.upfit.challengeservice.model.ChallengeParticipation;
import br.com.upfit.challengeservice.model.ChallengeStatus;
import br.com.upfit.challengeservice.model.ChallengeType;
import br.com.upfit.challengeservice.repository.ChallengeParticipationRepository;
import br.com.upfit.challengeservice.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository participationRepository;
    private final NotificationEventPublisher eventPublisher;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket.challenge-assets}")
    private String challengeAssetsBucket;

    // ─── CREATE ─────────────────────────────────────────────────────────────────

    @Transactional
    public ChallengeResponse createChallenge(CreateChallengeRequest request) {
        Challenge challenge = new Challenge();
        challenge.setTitle(request.title());
        challenge.setDescription(request.description());
        challenge.setGoal(request.goal());
        challenge.setGoalTarget(request.goalTarget());
        challenge.setRewardXp(request.rewardXp());
        challenge.setStartDate(request.startDate());
        challenge.setEndDate(request.endDate());
        challenge.setType(request.type());
        challenge.setRequiredLevel(request.requiredLevel());
        challenge.setCoverImageUrl(request.coverImageUrl());
        return ChallengeResponse.from(challengeRepository.save(challenge));
    }

    // ─── LIST ────────────────────────────────────────────────────────────────────

    public List<ChallengeDetailResponse> listChallenges(String typeParam, Boolean participating, UUID userId) {
        List<Challenge> challenges = (typeParam != null && !typeParam.isBlank())
                ? challengeRepository.findAllByStatusAndType(ChallengeStatus.ACTIVE, ChallengeType.valueOf(typeParam.toUpperCase()))
                : challengeRepository.findAllByStatus(ChallengeStatus.ACTIVE);

        Map<UUID, ChallengeParticipation> participationMap = participationRepository.findByUserId(userId)
                .stream().collect(java.util.stream.Collectors.toMap(ChallengeParticipation::getChallengeId, p -> p));

        return challenges.stream()
                .filter(c -> {
                    if (participating == null) return true;
                    boolean hasParticipation = participationMap.containsKey(c.getId());
                    return participating ? hasParticipation : !hasParticipation;
                })
                .map(c -> ChallengeDetailResponse.from(c, participationMap.get(c.getId())))
                .toList();
    }

    // ─── DETAIL ──────────────────────────────────────────────────────────────────

    public ChallengeDetailResponse getChallengeDetail(UUID challengeId, UUID userId) {
        Challenge challenge = findChallengeOrThrow(challengeId);
        ChallengeParticipation participation = participationRepository
                .findByUserIdAndChallengeId(userId, challengeId)
                .orElse(null);
        return ChallengeDetailResponse.from(challenge, participation);
    }

    // ─── JOIN ────────────────────────────────────────────────────────────────────

    @Transactional
    public ParticipationResponse joinChallenge(UUID challengeId, UUID userId, JoinChallengeRequest request) {
        Challenge challenge = findChallengeOrThrow(challengeId);

        if (challenge.getStatus() != ChallengeStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Challenge is not active");
        }

        if (participationRepository.existsByUserIdAndChallengeId(userId, challengeId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already participating in this challenge");
        }

        if (challenge.getRequiredLevel() != null && request.userLevel() < challenge.getRequiredLevel()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "User level " + request.userLevel() + " does not meet the required level " + challenge.getRequiredLevel());
        }

        ChallengeParticipation participation = new ChallengeParticipation();
        participation.setUserId(userId);
        participation.setChallengeId(challengeId);
        return ParticipationResponse.from(participationRepository.save(participation), challenge.getGoalTarget());
    }

    // ─── LEAVE ───────────────────────────────────────────────────────────────────

    @Transactional
    public void leaveChallenge(UUID challengeId, UUID userId) {
        ChallengeParticipation participation = participationRepository
                .findByUserIdAndChallengeId(userId, challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participation not found"));

        if (Boolean.TRUE.equals(participation.getCompleted())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot leave a completed challenge");
        }

        participationRepository.delete(participation);
    }

    // ─── PRESIGNED URL ───────────────────────────────────────────────────────────

    public PresignedUrlResponse generateUploadUrl(String filename) {
        String key = "challenges/" + UUID.randomUUID() + "/" + filename;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(challengeAssetsBucket)
                .key(key)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(5))
                        .putObjectRequest(objectRequest)
                        .build()
        );

        String presignedUrl = presignedRequest.url().toString();
        String objectUrl = presignedUrl.split("\\?")[0];

        return new PresignedUrlResponse(presignedUrl, objectUrl);
    }

    // ─── PROCESS WORKOUT RECORDED ────────────────────────────────────────────────

    @Transactional
    public void processWorkoutRecorded(WorkoutRecordedEvent event) {
        UUID userId = UUID.fromString(event.userId());
        log.info("[challenge-service] Processando WorkoutRecorded para userId={}, type={}", userId, event.type());

        List<ChallengeParticipation> activeParticipations =
                participationRepository.findByUserIdAndCompleted(userId, false);

        for (ChallengeParticipation participation : activeParticipations) {
            Challenge challenge = challengeRepository.findById(participation.getChallengeId()).orElse(null);
            if (challenge == null || challenge.getStatus() != ChallengeStatus.ACTIVE) continue;

            double progress = computeProgress(event);
            participation.setCurrentProgress(participation.getCurrentProgress() + progress);

            if (participation.getCurrentProgress() >= challenge.getGoalTarget()) {
                participation.setCompleted(true);
                participation.setCompletedAt(LocalDateTime.now());
                log.info("[challenge-service] Desafio {} concluído pelo usuário {}", challenge.getId(), userId);
                eventPublisher.publishChallengeCompleted(challenge.getId(), userId);
            }

            participationRepository.save(participation);
        }
    }

    // ─── EXPIRATION (called by ChallengeExpirationJob) ───────────────────────────

    @Transactional
    public int expireOverdueChallenges() {
        List<Challenge> expired = challengeRepository.findAllByStatusAndEndDateBefore(
                ChallengeStatus.ACTIVE, java.time.LocalDate.now()
        );
        expired.forEach(c -> c.setStatus(ChallengeStatus.EXPIRED));
        challengeRepository.saveAll(expired);
        return expired.size();
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

    private Challenge findChallengeOrThrow(UUID id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));
    }

    /**
     * Progress computation:
     * RUNNING → distanceKm (covers "run X km" type goals)
     * STRENGTH → durationMin (covers "exercise X minutes" type goals)
     */
    private double computeProgress(WorkoutRecordedEvent event) {
        if ("RUNNING".equalsIgnoreCase(event.type()) && event.distanceKm() != null) {
            return event.distanceKm();
        }
        return event.durationMin();
    }
}
