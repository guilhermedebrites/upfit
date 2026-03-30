package br.com.upfit.workoutservice.service;

import br.com.upfit.workoutservice.dto.CreateWorkoutRequest;
import br.com.upfit.workoutservice.messaging.WorkoutEventPublisher;
import br.com.upfit.workoutservice.model.*;
import br.com.upfit.workoutservice.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final WorkoutEventPublisher eventPublisher;

    @Transactional
    public Workout createWorkout(CreateWorkoutRequest request) {
        Workout workout = buildWorkout(request);
        workout = workoutRepository.save(workout);
        eventPublisher.publishWorkoutRecorded(workout, request.type());
        return workout;
    }

    private Workout buildWorkout(CreateWorkoutRequest request) {
        return switch (request.type().toUpperCase()) {
            case "RUNNING" -> buildRunningWorkout(request);
            case "STRENGTH" -> buildStrengthWorkout(request);
            default -> throw new IllegalArgumentException("Tipo de treino inválido: " + request.type());
        };
    }

    private RunningWorkout buildRunningWorkout(CreateWorkoutRequest request) {
        RunningWorkout workout = new RunningWorkout();
        setCommonFields(workout, request);
        workout.setDistanceKm(request.distanceKm());
        workout.setAveragePace(request.averagePace());
        return workout;
    }

    private StrengthWorkout buildStrengthWorkout(CreateWorkoutRequest request) {
        StrengthWorkout workout = new StrengthWorkout();
        setCommonFields(workout, request);
        workout.setPrimaryMuscleGroup(request.primaryMuscleGroup());

        if (request.exercises() != null) {
            request.exercises().forEach(e -> {
                ExerciseEntry entry = new ExerciseEntry();
                entry.setExerciseName(e.exerciseName());
                entry.setSets(e.sets());
                entry.setReps(e.reps());
                entry.setWeight(e.weight());
                entry.setRestSeconds(e.restSeconds());
                workout.getExercises().add(entry);
            });
        }
        return workout;
    }

    private void setCommonFields(Workout workout, CreateWorkoutRequest request) {
        workout.setUserId(request.userId());
        workout.setDateTime(LocalDateTime.now());
        workout.setDurationMin(request.durationMin());
        workout.setNotes(request.notes());
        workout.setCaloriesBurned(request.caloriesBurned());
    }
}
