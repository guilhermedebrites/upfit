package br.com.upfit.workoutservice.controller;

import br.com.upfit.workoutservice.dto.CreateWorkoutRequest;
import br.com.upfit.workoutservice.dto.WorkoutResponse;
import br.com.upfit.workoutservice.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping
    public ResponseEntity<WorkoutResponse> createWorkout(@Valid @RequestBody CreateWorkoutRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(WorkoutResponse.from(workoutService.createWorkout(request)));
    }
}
