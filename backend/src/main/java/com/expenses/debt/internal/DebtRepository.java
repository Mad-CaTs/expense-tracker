package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import com.expenses.wallet.PerWalletTotal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DebtRepository extends JpaRepository<Debt, Long> {

    Optional<Debt> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT d FROM Debt d WHERE d.user.id = :userId AND d.direction = :direction " +
           "ORDER BY d.personKey ASC, d.incurredOn DESC")
    List<Debt> findByUserAndDirection(@Param("userId") Long userId,
                                      @Param("direction") DebtDirection direction);

    List<Debt> findByUserIdAndExpenseId(Long userId, Long expenseId);

    @Query("SELECT COALESCE(SUM(d.amount - d.paidAmount), 0) FROM Debt d " +
           "WHERE d.user.id = :userId AND d.direction = :direction")
    BigDecimal sumPendingByDirection(@Param("userId") Long userId,
                                     @Param("direction") DebtDirection direction);

    /* ── Saldo: SOLO los préstamos sueltos (expenseId nulo) ──
       Cuando la deuda cuelga de un gasto, ese gasto ya descontó el total; volver
       a descontarla aquí contaría el dinero dos veces. */

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Debt d WHERE d.user.id = :userId " +
           "AND d.wallet.id = :walletId AND d.expenseId IS NULL AND d.direction = :direction")
    BigDecimal sumLooseByWalletAndDirection(@Param("userId") Long userId,
                                            @Param("walletId") Long walletId,
                                            @Param("direction") DebtDirection direction);

    @Query("SELECT d.wallet.id AS walletId, SUM(d.amount) AS total FROM Debt d " +
           "WHERE d.user.id = :userId AND d.expenseId IS NULL AND d.direction = :direction " +
           "GROUP BY d.wallet.id")
    List<PerWalletTotal> sumLooseGroupedByWallet(@Param("userId") Long userId,
                                                 @Param("direction") DebtDirection direction);

    @Modifying
    @Query("UPDATE Debt d SET d.deletedAt = :deletedAt " +
           "WHERE d.user.id = :userId AND d.wallet.id = :walletId AND d.deletedAt IS NULL")
    void softDeleteByWalletId(@Param("userId") Long userId,
                              @Param("walletId") Long walletId,
                              @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("UPDATE Debt d SET d.deletedAt = :deletedAt " +
           "WHERE d.user.id = :userId AND d.expenseId = :expenseId AND d.deletedAt IS NULL")
    void softDeleteByExpenseId(@Param("userId") Long userId,
                               @Param("expenseId") Long expenseId,
                               @Param("deletedAt") LocalDateTime deletedAt);
}
