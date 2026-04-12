package br.com.upfit.progressionservice.controller;

import br.com.upfit.progressionservice.dto.ProgressionResponse;
import br.com.upfit.progressionservice.service.ProgressionEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/progression")
@RequiredArgsConstructor
public class ProgressionController {

    private final ProgressionEngineService progressionEngineService;

    @GetMapping("/{userId}")
    public ResponseEntity<ProgressionResponse> getProgression(@PathVariable UUID userId) {
        var progression = progressionEngineService.getByUserId(userId);
        var achievements = progressionEngineService.getAchievementsByUserId(userId);
        return ResponseEntity.ok(ProgressionResponse.from(progression, achievements));
    }
}
