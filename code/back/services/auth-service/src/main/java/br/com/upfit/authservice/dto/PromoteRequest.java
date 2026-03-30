package br.com.upfit.authservice.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PromoteRequest(
        @NotNull UUID userId
) {}
