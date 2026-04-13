package br.com.upfit.groupservice.controller;

import br.com.upfit.groupservice.dto.*;
import br.com.upfit.groupservice.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping("/groups")
    public ResponseEntity<GroupResponse> createGroup(
            @AuthenticationPrincipal String userIdStr,
            @Valid @RequestBody CreateGroupRequest request) {
        GroupResponse response = groupService.createGroup(UUID.fromString(userIdStr), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/groups/{id}")
    public ResponseEntity<GroupResponse> updateGroup(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userIdStr,
            @RequestBody UpdateGroupRequest request) {
        String role = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().iterator().next().getAuthority();
        GroupResponse response = groupService.updateGroup(id, UUID.fromString(userIdStr), role, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/groups/{id}/join")
    public ResponseEntity<Void> joinGroup(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userIdStr) {
        groupService.joinGroup(id, UUID.fromString(userIdStr));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/groups/{id}/leave")
    public ResponseEntity<Void> leaveGroup(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userIdStr) {
        groupService.leaveGroup(id, UUID.fromString(userIdStr));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/groups/upload-url")
    public ResponseEntity<PresignedUrlResponse> getUploadUrl(@RequestParam String filename) {
        return ResponseEntity.ok(groupService.getUploadUrl(filename));
    }
}
