package br.com.upfit.challengeservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChallengeExpirationJob {

    private final ChallengeService challengeService;

    @Scheduled(cron = "0 0 0 * * *")
    public void expireChallenges() {
        int count = challengeService.expireOverdueChallenges();
        log.info("[challenge-service] Job de expiração: {} desafio(s) expirado(s)", count);
    }
}
