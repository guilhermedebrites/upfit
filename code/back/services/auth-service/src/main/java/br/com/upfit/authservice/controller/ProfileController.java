package br.com.upfit.authservice.controller;

import br.com.upfit.authservice.dto.PresignedUrlResponse;
import br.com.upfit.authservice.dto.ProfileResponse;
import br.com.upfit.authservice.dto.UpdateProfileRequest;
import br.com.upfit.authservice.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/upload-url")
    public ResponseEntity<PresignedUrlResponse> getUploadUrl(
            @RequestParam String filename,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(profileService.generateUploadUrl(filename));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ProfileResponse> updateProfile(
            @PathVariable UUID userId,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }
}
