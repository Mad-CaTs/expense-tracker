package com.expenses.expense.internal;

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

public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {

    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.wallet.id = :walletId")
    BigDecimal sumAmountByUserIdAndWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId);

    @Query("SELECT e.wallet.id AS walletId, SUM(e.amount) AS total FROM Expense e " +
           "WHERE e.user.id = :userId AND e.wallet IS NOT NULL GROUP BY e.wallet.id")
    List<PerWalletTotal> sumAmountByUserIdGroupedByWallet(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Expense e SET e.deletedAt = :now " +
           "WHERE e.user.id = :userId AND e.wallet.id = :walletId AND e.deletedAt IS NULL")
    int softDeleteByWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId, @Param("now") LocalDateTime now);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.date BETWEEN :from AND :to")
    BigDecimal sumAmountByUserIdAndDateBetween(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.date BETWEEN :from AND :to AND e.category.id = :categoryId")
    BigDecimal sumAmountByUserIdAndDateBetweenAndCategoryId(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("categoryId") Long categoryId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.user.id = :userId AND e.category.id = :categoryId AND e.wallet.id = :walletId " +
           "AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    BigDecimal sumSpentByCategoryWalletAndPeriod(@Param("userId") Long userId,
                                                 @Param("categoryId") Long categoryId,
                                                 @Param("walletId") Long walletId,
                                                 @Param("month") Integer month,
                                                 @Param("year") Integer year);

    @Query("SELECT e.category.id AS categoryId, e.wallet.id AS walletId, SUM(e.amount) AS total FROM Expense e " +
           "WHERE e.user.id = :userId AND e.wallet IS NOT NULL " +
           "AND MONTH(e.date) = :month AND YEAR(e.date) = :year " +
           "GROUP BY e.category.id, e.wallet.id")
    List<CategoryWalletSum> sumSpentByPeriodGroupedByCategoryAndWallet(@Param("userId") Long userId,
                                                                       @Param("month") Integer month,
                                                                       @Param("year") Integer year);

    @Query("""
        SELECT e.category.name AS name, SUM(e.amount) AS total, COUNT(e) AS count,
               e.category.color AS color, e.category.icon AS icon
        FROM Expense e
        WHERE e.user.id = :userId AND e.date BETWEEN :from AND :to AND e.category.id = :categoryId
          AND (:walletId IS NULL OR e.wallet.id = :walletId)
        GROUP BY e.category.name, e.category.color, e.category.icon
        ORDER BY SUM(e.amount) DESC
        """)
    List<CategoryBreakdownRow> findCategoryBreakdownByUserIdAndCategoryId(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("categoryId") Long categoryId, @Param("walletId") Long walletId);

    @Query("""
        SELECT e.category.name AS name, SUM(e.amount) AS total, COUNT(e) AS count,
               e.category.color AS color, e.category.icon AS icon
        FROM Expense e
        WHERE e.user.id = :userId AND e.date BETWEEN :from AND :to
          AND (:walletId IS NULL OR e.wallet.id = :walletId)
        GROUP BY e.category.name, e.category.color, e.category.icon
        ORDER BY SUM(e.amount) DESC
        """)
    List<CategoryBreakdownRow> findCategoryBreakdownByUserId(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("walletId") Long walletId);
}
