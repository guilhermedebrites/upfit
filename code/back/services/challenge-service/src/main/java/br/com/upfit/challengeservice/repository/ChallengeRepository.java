package br.com.upfit.challengeservice.repository;

import br.com.upfit.challengeservice.model.Challenge;
import br.com.upfit.challengeservice.model.ChallengeStatus;
import br.com.upfit.challengeservice.model.ChallengeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {

    List<Challenge> findAllByStatus(ChallengeStatus status);

    List<Challenge> findAllByStatusAndType(ChallengeStatus status, ChallengeType type);

    List<Challenge> findAllByStatusAndEndDateBefore(ChallengeStatus status, LocalDate date);
}
