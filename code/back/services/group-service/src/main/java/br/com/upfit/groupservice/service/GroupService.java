package br.com.upfit.groupservice.service;

import br.com.upfit.groupservice.config.GroupLevelThresholdService;
import br.com.upfit.groupservice.dto.*;
import br.com.upfit.groupservice.messaging.NotificationEventPublisher;
import br.com.upfit.groupservice.model.Group;
import br.com.upfit.groupservice.model.GroupMembership;
import br.com.upfit.groupservice.model.GroupRole;
import br.com.upfit.groupservice.repository.GroupMembershipRepository;
import br.com.upfit.groupservice.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMembershipRepository membershipRepository;
    private final GroupLevelThresholdService levelThresholdService;
    private final NotificationEventPublisher eventPublisher;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket.group-assets:group-assets}")
    private String groupAssetsBucket;

    @Value("${aws.endpoint:}")
    private String awsEndpoint;

    @Transactional
    public GroupResponse createGroup(UUID creatorId, CreateGroupRequest request) {
        Group group = new Group();
        group.setName(request.name());
        group.setDescription(request.description());
        group.setImageUrl(request.imageUrl());
        group.setWeeklyGoal(request.weeklyGoal());
        group = groupRepository.save(group);

        GroupMembership membership = new GroupMembership();
        membership.setUserId(creatorId);
        membership.setGroupId(group.getId());
        membership.setRole(GroupRole.OWNER);
        membershipRepository.save(membership);

        return GroupResponse.from(group);
    }

    @Transactional
    public GroupResponse updateGroup(UUID groupId, UUID requesterId, String requesterRole, UpdateGroupRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        boolean isPlatformAdmin = "ADMIN".equals(requesterRole);
        boolean isOwner = membershipRepository.findByGroupIdAndUserId(groupId, requesterId)
                .map(m -> m.getRole() == GroupRole.OWNER)
                .orElse(false);

        if (!isPlatformAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only OWNER or platform ADMIN can edit the group");
        }

        if (request.name() != null) group.setName(request.name());
        if (request.description() != null) group.setDescription(request.description());
        if (request.imageUrl() != null) group.setImageUrl(request.imageUrl());
        if (request.weeklyGoal() != null) group.setWeeklyGoal(request.weeklyGoal());

        return GroupResponse.from(groupRepository.save(group));
    }

    @Transactional
    public void joinGroup(UUID groupId, UUID userId) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        if (membershipRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a member of this group");
        }

        GroupMembership membership = new GroupMembership();
        membership.setUserId(userId);
        membership.setGroupId(groupId);
        membership.setRole(GroupRole.MEMBER);
        membershipRepository.save(membership);

        eventPublisher.publishMemberJoined(groupId, userId);
    }

    @Transactional
    public void leaveGroup(UUID groupId, UUID userId) {
        GroupMembership membership = membershipRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membership not found"));

        if (membership.getRole() == GroupRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "OWNER cannot leave the group");
        }

        membershipRepository.delete(membership);
        eventPublisher.publishMemberLeft(groupId, userId);
    }

    public PresignedUrlResponse getUploadUrl(String filename) {
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .putObjectRequest(PutObjectRequest.builder()
                        .bucket(groupAssetsBucket)
                        .key(filename)
                        .build())
                .build();

        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);
        String presignedUrl = presigned.url().toString();
        String objectUrl = (awsEndpoint.isBlank() ? "" : awsEndpoint) + "/" + groupAssetsBucket + "/" + filename;

        return new PresignedUrlResponse(presignedUrl, objectUrl);
    }

    @Transactional
    public void processWorkoutRecorded(WorkoutRecordedEvent event) {
        List<GroupMembership> memberships = membershipRepository.findByUserId(event.userId());
        if (memberships.isEmpty()) return;

        int xpGained = computeXp(event);

        for (GroupMembership membership : memberships) {
            membership.setGroupScore(membership.getGroupScore() + xpGained);
            membershipRepository.save(membership);

            Group group = groupRepository.findById(membership.getGroupId()).orElse(null);
            if (group == null) continue;

            group.setGroupXp(group.getGroupXp() + xpGained);
            int oldLevel = group.getGroupLevel();
            int newLevel = levelThresholdService.calculateLevel(group.getGroupXp());
            group.setGroupLevel(newLevel);
            groupRepository.save(group);

            if (newLevel > oldLevel) {
                log.info("[group-service] Grupo {} subiu para nível {}", group.getId(), newLevel);
                eventPublisher.publishGroupLevelUp(group.getId(), newLevel);
            }
        }
    }

    private int computeXp(WorkoutRecordedEvent event) {
        if ("RUNNING".equalsIgnoreCase(event.type()) && event.distanceKm() != null) {
            return (int) Math.round(event.distanceKm() * 10);
        }
        return event.durationMin();
    }
}
