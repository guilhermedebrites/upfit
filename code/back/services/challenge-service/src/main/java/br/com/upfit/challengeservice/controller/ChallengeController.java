package br.com.upfit.challengeservice.controller;

import br.com.upfit.challengeservice.dto.*;
import br.com.upfit.challengeservice.service.ChallengeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChallengeResponse createChallenge(@Valid @RequestBody CreateChallengeRequest request) {
        return challengeService.createChallenge(request);
    }

    @GetMapping
    public List<ChallengeDetailResponse> listChallenges(@RequestParam(required = false) String type,
                                                        @RequestParam(required = false) Boolean participating,
                                                        @AuthenticationPrincipal String userIdStr) {
        return challengeService.listChallenges(type, participating, UUID.fromString(userIdStr));
    }

    @GetMapping("/{id}")
    public ChallengeDetailResponse getChallengeDetail(@PathVariable UUID id,
                                                      @AuthenticationPrincipal String userIdStr) {
        return challengeService.getChallengeDetail(id, UUID.fromString(userIdStr));
    }

    @PostMapping("/{id}/join")
    @ResponseStatus(HttpStatus.CREATED)
    public ParticipationResponse joinChallenge(@PathVariable UUID id,
                                               @Valid @RequestBody JoinChallengeRequest request,
                                               @AuthenticationPrincipal String userIdStr) {
        return challengeService.joinChallenge(id, UUID.fromString(userIdStr), request);
    }

    @DeleteMapping("/{id}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveChallenge(@PathVariable UUID id,
                               @AuthenticationPrincipal String userIdStr) {
        challengeService.leaveChallenge(id, UUID.fromString(userIdStr));
    }

    @GetMapping("/upload-url")
    public PresignedUrlResponse getUploadUrl(@RequestParam String filename) {
        return challengeService.generateUploadUrl(filename);
    }
}
