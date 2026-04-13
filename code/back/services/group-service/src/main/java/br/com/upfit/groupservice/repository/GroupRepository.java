package br.com.upfit.groupservice.repository;

import br.com.upfit.groupservice.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID> {}
