package br.com.upfit.workoutservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "running_workouts")
@PrimaryKeyJoinColumn(name = "workout_id")
@Getter
@Setter
@NoArgsConstructor
public class RunningWorkout extends Workout {

    private Double distanceKm;

    private Double averagePace;
}
