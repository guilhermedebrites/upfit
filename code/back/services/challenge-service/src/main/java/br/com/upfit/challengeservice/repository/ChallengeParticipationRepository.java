package br.com.upfit.challengeservice.repository;

import br.com.upfit.challengeservice.model.ChallengeParticipation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChallengeParticipationRepository extends JpaRepository<ChallengeParticipation, UUID> {

    Optional<ChallengeParticipation> findByUserIdAndChallengeId(UUID userId, UUID challengeId);

    boolean existsByUserIdAndChallengeId(UUID userId, UUID challengeId);

    List<ChallengeParticipation> findByUserIdAndCompleted(UUID userId, Boolean completed);

    List<ChallengeParticipation> findByUserId(UUID userId);
}
