package br.com.upfit.progressionservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "achievements")
@Getter
@Setter
@NoArgsConstructor
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID progressionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "definition_id", nullable = false)
    private AchievementDefinition definition;

    @Column(nullable = false)
    private LocalDateTime unlockedAt = LocalDateTime.now();
}
