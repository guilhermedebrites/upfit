package br.com.upfit.progressionservice.repository;

import br.com.upfit.progressionservice.model.Progression;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProgressionRepository extends JpaRepository<Progression, UUID> {
    Optional<Progression> findByUserId(UUID userId);
}
