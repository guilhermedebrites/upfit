package br.com.upfit.groupservice.repository;

import br.com.upfit.groupservice.model.GroupFeedEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GroupFeedEntryRepository extends JpaRepository<GroupFeedEntry, UUID> {

    List<GroupFeedEntry> findTop10ByGroupIdOrderByRecordedAtDesc(UUID groupId);
}
