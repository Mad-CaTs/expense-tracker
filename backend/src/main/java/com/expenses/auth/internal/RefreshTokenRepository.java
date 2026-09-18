package com.expenses.auth.internal;

import com.expenses.shared.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void deleteByUser(User user);
    void deleteByFamilyId(String familyId);

    /**
     * Borra los tokens que ya no sirven para nada.
     *
     * <p>Sin esto la tabla solo crece: cada renovacion deja atras el token
     * usado, y en produccion se acumularon 169 filas. Se borran los CADUCADOS,
     * no los usados: un token usado sigue siendo util mientras no expire,
     * porque es lo que permite detectar un reuso —si desaparece, un token
     * robado y reenviado pasaria por nuevo en vez de revocar la familia—.
     */
    @Modifying
    @Query("DELETE FROM RefreshToken t WHERE t.expiresAt < :cutoff")
    int deleteByExpiresAtBefore(@Param("cutoff") LocalDateTime cutoff);
}
