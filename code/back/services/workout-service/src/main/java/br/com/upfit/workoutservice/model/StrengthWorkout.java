package br.com.upfit.workoutservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "strength_workouts")
@PrimaryKeyJoinColumn(name = "workout_id")
@Getter
@Setter
@NoArgsConstructor
public class StrengthWorkout extends Workout {

    private String primaryMuscleGroup;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "strength_workout_id")
    private List<ExerciseEntry> exercises = new ArrayList<>();
}
