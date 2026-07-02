package com.expenses.repository;

import com.expenses.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
           "AND (:walletId IS NULL OR b.wallet.id = :walletId)")
    List<Budget> findByUserIdAndOptionalWallet(@Param("userId") Long userId, @Param("walletId") Long walletId);

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    Optional<Budget> findByUserIdAndCategoryIdAndWalletId(Long userId, Long categoryId, Long walletId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.user.id = :userId AND e.category.id = :categoryId " +
           "AND e.wallet.id = :walletId " +
           "AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    java.math.BigDecimal sumSpentByCategoryWalletAndPeriod(@Param("userId") Long userId,
                                                           @Param("categoryId") Long categoryId,
                                                           @Param("walletId") Long walletId,
                                                           @Param("month") Integer month,
                                                           @Param("year") Integer year);
}
