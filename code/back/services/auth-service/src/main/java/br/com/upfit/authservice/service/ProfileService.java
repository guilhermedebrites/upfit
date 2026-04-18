package br.com.upfit.authservice.service;

import br.com.upfit.authservice.dto.PresignedUrlResponse;
import br.com.upfit.authservice.dto.ProfileResponse;
import br.com.upfit.authservice.dto.UpdateProfileRequest;
import br.com.upfit.authservice.model.Profile;
import br.com.upfit.authservice.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket.profile-assets:profile-assets}")
    private String profileAssetsBucket;

    @Value("${aws.public-endpoint:${aws.endpoint:}}")
    private String awsPublicEndpoint;

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

    public PresignedUrlResponse generateUploadUrl(String filename) {
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .putObjectRequest(PutObjectRequest.builder()
                        .bucket(profileAssetsBucket)
                        .key(filename)
                        .build())
                .build();

        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);
        String presignedUrl = presigned.url().toString();
        String objectUrl = (awsPublicEndpoint == null || awsPublicEndpoint.isBlank() ? "" : awsPublicEndpoint)
                + "/" + profileAssetsBucket + "/" + filename;

        return new PresignedUrlResponse(presignedUrl, objectUrl);
    }
}
