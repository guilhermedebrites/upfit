package br.com.upfit.progressionservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "progressions")
@Getter
@Setter
@NoArgsConstructor
public class Progression {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false)
    private int currentXp = 0;

    @Column(nullable = false)
    private int totalXp = 0;

    @Column(nullable = false)
    private int level = 1;

    @Column(nullable = false)
    private int streakDays = 0;

    private LocalDate lastWorkoutDate;

    public static Progression newFor(UUID userId) {
        Progression p = new Progression();
        p.setUserId(userId);
        return p;
    }
}
