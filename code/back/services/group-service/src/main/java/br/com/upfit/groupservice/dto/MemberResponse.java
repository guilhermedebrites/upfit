package br.com.upfit.groupservice.dto;

import br.com.upfit.groupservice.model.GroupMembership;
import br.com.upfit.groupservice.model.GroupRole;

import java.time.LocalDateTime;
import java.util.UUID;

public record MemberResponse(
        UUID userId,
        GroupRole role,
        int groupScore,
        LocalDateTime joinedAt
) {
    public static MemberResponse from(GroupMembership m) {
        return new MemberResponse(m.getUserId(), m.getRole(), m.getGroupScore(), m.getJoinedAt());
    }
}
