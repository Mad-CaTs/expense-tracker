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

public interface DebtPaymentRepository extends JpaRepository<DebtPayment, Long> {

    List<DebtPayment> findByUserIdAndDebtIdOrderByPaidOnDescIdDesc(Long userId, Long debtId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM DebtPayment p, Debt d " +
           "WHERE p.debtId = d.id AND p.user.id = :userId AND p.wallet.id = :walletId " +
           "AND d.direction = :direction")
    BigDecimal sumByWalletAndDirection(@Param("userId") Long userId,
                                       @Param("walletId") Long walletId,
                                       @Param("direction") DebtDirection direction);

    @Query("SELECT p.wallet.id AS walletId, SUM(p.amount) AS total FROM DebtPayment p, Debt d " +
           "WHERE p.debtId = d.id AND p.user.id = :userId AND d.direction = :direction " +
           "GROUP BY p.wallet.id")
    List<PerWalletTotal> sumGroupedByWallet(@Param("userId") Long userId,
                                            @Param("direction") DebtDirection direction);

    @Modifying
    @Query("UPDATE DebtPayment p SET p.deletedAt = :deletedAt " +
           "WHERE p.user.id = :userId AND p.wallet.id = :walletId AND p.deletedAt IS NULL")
    void softDeleteByWalletId(@Param("userId") Long userId,
                              @Param("walletId") Long walletId,
                              @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("UPDATE DebtPayment p SET p.deletedAt = :deletedAt " +
           "WHERE p.user.id = :userId AND p.debtId IN :debtIds AND p.deletedAt IS NULL")
    void softDeleteByDebtIds(@Param("userId") Long userId,
                             @Param("debtIds") List<Long> debtIds,
                             @Param("deletedAt") LocalDateTime deletedAt);
}
