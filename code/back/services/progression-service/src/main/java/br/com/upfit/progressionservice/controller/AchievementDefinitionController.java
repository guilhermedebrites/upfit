package br.com.upfit.progressionservice.controller;

import br.com.upfit.progressionservice.dto.AchievementDefinitionResponse;
import br.com.upfit.progressionservice.dto.CreateAchievementDefinitionRequest;
import br.com.upfit.progressionservice.service.AchievementDefinitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/achievements/definitions")
@RequiredArgsConstructor
public class AchievementDefinitionController {

    private final AchievementDefinitionService service;

    @PostMapping
    public ResponseEntity<AchievementDefinitionResponse> create(@Valid @RequestBody CreateAchievementDefinitionRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(AchievementDefinitionResponse.from(service.create(request)));
    }

    @GetMapping
    public ResponseEntity<List<AchievementDefinitionResponse>> listAll() {
        return ResponseEntity.ok(
                service.listAll().stream().map(AchievementDefinitionResponse::from).toList()
        );
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<AchievementDefinitionResponse> toggle(@PathVariable UUID id) {
        return ResponseEntity.ok(AchievementDefinitionResponse.from(service.toggle(id)));
    }
}
