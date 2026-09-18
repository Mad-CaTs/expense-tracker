package com.expenses.auth.internal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Limpieza periodica de refresh tokens caducados.
 */
@Component
@RequiredArgsConstructor
@Slf4j
class RefreshTokenCleanupJob {

    private final RefreshTokenRepository refreshTokenRepository;

    /** De madrugada, cuando nadie renueva sesion. */
    @Scheduled(cron = "${app.auth.token-cleanup-cron:0 30 3 * * *}")
    @Transactional
    public void purgeExpired() {
        int borrados = refreshTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        if (borrados > 0) {
            log.info("Limpieza de refresh tokens: {} caducados eliminados", borrados);
        }
    }
}
