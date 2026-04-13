package br.com.upfit.groupservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "group_feed_entries")
@Getter
@Setter
@NoArgsConstructor
public class GroupFeedEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID groupId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID workoutId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private int durationMin;

    private Double caloriesBurned;

    private Double distanceKm;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    public void prePersist() {
        if (recordedAt == null) recordedAt = LocalDateTime.now();
    }
}
