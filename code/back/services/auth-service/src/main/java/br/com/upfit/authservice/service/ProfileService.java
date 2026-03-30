package br.com.upfit.authservice.service;

import br.com.upfit.authservice.dto.ProfileResponse;
import br.com.upfit.authservice.dto.UpdateProfileRequest;
import br.com.upfit.authservice.model.Profile;
import br.com.upfit.authservice.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileResponse getProfile(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Perfil não encontrado para userId: " + userId));
        return ProfileResponse.from(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Perfil não encontrado para userId: " + userId));

        if (request.photoUrl() != null)       profile.setPhotoUrl(request.photoUrl());
        if (request.bio() != null)            profile.setBio(request.bio());
        if (request.weight() != null)         profile.setWeight(request.weight());
        if (request.height() != null)         profile.setHeight(request.height());
        if (request.goal() != null)           profile.setGoal(request.goal());
        if (request.experienceLevel() != null) profile.setExperienceLevel(request.experienceLevel());

        return ProfileResponse.from(profileRepository.save(profile));
    }
}
