package br.com.upfit.progressionservice.service;

import br.com.upfit.progressionservice.dto.CreateAchievementDefinitionRequest;
import br.com.upfit.progressionservice.model.AchievementDefinition;
import br.com.upfit.progressionservice.repository.AchievementDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AchievementDefinitionService {

    private final AchievementDefinitionRepository repository;

    public AchievementDefinition create(CreateAchievementDefinitionRequest request) {
        AchievementDefinition def = new AchievementDefinition();
        def.setTitle(request.title());
        def.setDescription(request.description());
        def.setType(request.type());
        def.setRule(request.rule());
        def.setThreshold(request.threshold());
        def.setActive(true);
        return repository.save(def);
    }

    public List<AchievementDefinition> listAll() {
        return repository.findAll();
    }

    public AchievementDefinition toggle(UUID id) {
        AchievementDefinition def = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("AchievementDefinition não encontrada: " + id));
        def.setActive(!def.isActive());
        return repository.save(def);
    }
}
