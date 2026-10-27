package com.expenses.savings.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PiggyBankRepository extends JpaRepository<PiggyBank, Long> {

    List<PiggyBank> findByUserIdAndWalletIdOrderByCreatedAtAscIdAsc(Long userId, Long walletId);

    Optional<PiggyBank> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndWalletId(Long userId, Long walletId);

    boolean existsByUserIdAndWalletIdAndNameIgnoreCase(Long userId, Long walletId, String name);

    boolean existsByUserIdAndWalletIdAndNameIgnoreCaseAndIdNot(Long userId, Long walletId, String name, Long id);

    /**
     * Nombres por id, INCLUIDAS las rotas. Nativa a propósito: `@SQLRestriction`
     * las excluye de cualquier consulta JPQL, y sus movimientos siguen en el
     * historial —sin nombre se verían como de una alcancía desconocida.
     *
     * @return filas `[id, name]`
     */
    @Query(value = "SELECT id, name FROM piggy_banks WHERE user_id = :userId AND id IN (:ids)", nativeQuery = true)
    List<Object[]> findNamesIncludingBroken(@Param("userId") Long userId, @Param("ids") Collection<Long> ids);

    @Modifying
    @Query("UPDATE PiggyBank p SET p.deletedAt = :now WHERE p.user.id = :userId "
         + "AND p.wallet.id = :walletId AND p.deletedAt IS NULL")
    void softDeleteByWalletId(@Param("userId") Long userId,
                              @Param("walletId") Long walletId,
                              @Param("now") LocalDateTime now);
}
