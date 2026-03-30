package br.com.upfit.authservice.service;

import br.com.upfit.authservice.config.JwtProperties;
import br.com.upfit.authservice.config.JwtService;
import br.com.upfit.authservice.dto.*;
import br.com.upfit.authservice.model.Profile;
import br.com.upfit.authservice.model.RefreshToken;
import br.com.upfit.authservice.model.User;
import br.com.upfit.authservice.model.UserRole;
import br.com.upfit.authservice.repository.ProfileRepository;
import br.com.upfit.authservice.repository.RefreshTokenRepository;
import br.com.upfit.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user = userRepository.save(user);

        Profile profile = new Profile();
        profile.setUserId(user.getId());
        profileRepository.save(profile);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Refresh token inválido"));

        if (stored.isExpired()) {
            refreshTokenRepository.delete(stored);
            throw new IllegalArgumentException("Refresh token expirado");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        refreshTokenRepository.delete(stored);
        return buildAuthResponse(user);
    }

    @Transactional
    public void promoteToAdmin(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userId));
        user.setRole(UserRole.ADMIN);
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshTokenValue = UUID.randomUUID().toString();

        refreshTokenRepository.deleteByUserId(user.getId());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUserId(user.getId());
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(jwtProperties.refreshTokenExpirationDays()));
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(accessToken, refreshTokenValue, user.getId(), user.getName(), user.getEmail());
    }
}
