package br.com.upfit.authservice.dto;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UUID userId,
        String name,
        String email
) {}
