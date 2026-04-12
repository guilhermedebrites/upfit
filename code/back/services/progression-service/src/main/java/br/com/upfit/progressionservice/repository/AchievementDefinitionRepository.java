package br.com.upfit.progressionservice.repository;

import br.com.upfit.progressionservice.model.AchievementDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AchievementDefinitionRepository extends JpaRepository<AchievementDefinition, UUID> {
    List<AchievementDefinition> findByActiveTrue();
}
