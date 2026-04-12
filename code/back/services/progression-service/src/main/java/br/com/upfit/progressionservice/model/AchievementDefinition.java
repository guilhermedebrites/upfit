package br.com.upfit.progressionservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "achievement_definitions")
@Getter
@Setter
@NoArgsConstructor
public class AchievementDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AchievementType type;

    @Column(nullable = false)
    private String rule;       // ex: "STREAK_7", "VOLUME_1000", "LEVEL_5"

    @Column(nullable = false)
    private Double threshold;

    @Column(nullable = false)
    private boolean active = true;
}
