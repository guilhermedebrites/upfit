package br.com.upfit.groupservice.repository;

import br.com.upfit.groupservice.model.GroupMembership;
import br.com.upfit.groupservice.model.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMembershipRepository extends JpaRepository<GroupMembership, UUID> {

    Optional<GroupMembership> findByGroupIdAndUserId(UUID groupId, UUID userId);

    boolean existsByGroupIdAndUserId(UUID groupId, UUID userId);

    boolean existsByUserIdAndRole(UUID userId, GroupRole role);

    List<GroupMembership> findByUserId(UUID userId);

    List<GroupMembership> findByGroupId(UUID groupId);

    List<GroupMembership> findByGroupIdOrderByGroupScoreDesc(UUID groupId);
}
