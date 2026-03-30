package br.com.upfit.workoutservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "exercise_entries")
@Getter
@Setter
@NoArgsConstructor
public class ExerciseEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String exerciseName;

    private int sets;

    private int reps;

    private Double weight;

    private int restSeconds;
}
