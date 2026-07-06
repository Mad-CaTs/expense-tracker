package com.expenses.income.internal;

import com.expenses.wallet.PerWalletTotal;
import com.expenses.shared.query.CategoryBreakdownRow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IncomeRepository extends JpaRepository<Income, Long>, JpaSpecificationExecutor<Income> {

    Optional<Income> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId AND i.wallet.id = :walletId")
    BigDecimal sumAmountByUserIdAndWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId);

    @Query("SELECT i.wallet.id AS walletId, SUM(i.amount) AS total FROM Income i " +
           "WHERE i.user.id = :userId AND i.wallet IS NOT NULL GROUP BY i.wallet.id")
    List<PerWalletTotal> sumAmountByUserIdGroupedByWallet(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Income i SET i.deletedAt = :now " +
           "WHERE i.user.id = :userId AND i.wallet.id = :walletId AND i.deletedAt IS NULL")
    int softDeleteByWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId, @Param("now") LocalDateTime now);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId AND i.date BETWEEN :from AND :to")
    BigDecimal sumAmountByUserIdAndDateBetween(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
        SELECT i.category.name AS name, SUM(i.amount) AS total, COUNT(i) AS count,
               i.category.color AS color, i.category.icon AS icon
        FROM Income i
        WHERE i.user.id = :userId AND i.date BETWEEN :from AND :to AND i.category IS NOT NULL
          AND (:walletId IS NULL OR i.wallet.id = :walletId)
        GROUP BY i.category.name, i.category.color, i.category.icon
        ORDER BY SUM(i.amount) DESC
        """)
    List<CategoryBreakdownRow> findCategoryBreakdownByUserId(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("walletId") Long walletId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) AS total, COUNT(i) AS count FROM Income i " +
           "WHERE i.user.id = :userId AND i.date BETWEEN :from AND :to AND i.category IS NULL " +
           "AND (:walletId IS NULL OR i.wallet.id = :walletId)")
    UncategorizedTotals findUncategorizedTotals(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("walletId") Long walletId);
}
