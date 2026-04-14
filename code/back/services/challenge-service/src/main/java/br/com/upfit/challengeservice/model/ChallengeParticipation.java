package br.com.upfit.challengeservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "challenge_participations")
public class ChallengeParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID challengeId;

    @Column(nullable = false)
    private Double currentProgress = 0.0;

    @Column(nullable = false)
    private Boolean completed = false;

    private LocalDateTime completedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    public void prePersist() {
        if (joinedAt == null) joinedAt = LocalDateTime.now();
        if (currentProgress == null) currentProgress = 0.0;
        if (completed == null) completed = false;
    }
}
