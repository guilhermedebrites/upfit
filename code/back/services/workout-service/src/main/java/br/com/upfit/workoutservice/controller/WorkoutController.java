package br.com.upfit.workoutservice.controller;

import br.com.upfit.workoutservice.dto.CreateWorkoutRequest;
import br.com.upfit.workoutservice.dto.WorkoutResponse;
import br.com.upfit.workoutservice.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping
    public ResponseEntity<WorkoutResponse> createWorkout(
            @AuthenticationPrincipal String userIdStr,
            @Valid @RequestBody CreateWorkoutRequest request) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(WorkoutResponse.from(workoutService.createWorkout(userId, request)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkoutResponse>> listByUser(@PathVariable UUID userId) {
        List<WorkoutResponse> workouts = workoutService.listByUser(userId)
                .stream()
                .map(WorkoutResponse::from)
                .toList();
        return ResponseEntity.ok(workouts);
    }
}
