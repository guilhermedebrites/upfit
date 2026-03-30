package br.com.upfit.workoutservice.repository;

import br.com.upfit.workoutservice.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkoutRepository extends JpaRepository<Workout, UUID> {}
