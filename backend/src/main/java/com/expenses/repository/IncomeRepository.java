package com.expenses.repository;

import com.expenses.entity.Income;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    Page<Income> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate from, LocalDate to, Pageable pageable);

    Page<Income> findByUserIdAndWalletIdAndDateBetweenOrderByDateDesc(Long userId, Long walletId, LocalDate from, LocalDate to, Pageable pageable);

    Optional<Income> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId AND i.date BETWEEN :from AND :to")
    BigDecimal sumAmountByUserIdAndDateBetween(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
        SELECT i.category.name, SUM(i.amount), COUNT(i), i.category.color, i.category.icon
        FROM Income i
        WHERE i.user.id = :userId AND i.date BETWEEN :from AND :to AND i.category IS NOT NULL
          AND (:walletId IS NULL OR i.wallet.id = :walletId)
        GROUP BY i.category.name, i.category.color, i.category.icon
        ORDER BY SUM(i.amount) DESC
        """)
    List<Object[]> findCategoryBreakdownByUserId(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("walletId") Long walletId);

    @Query("SELECT COALESCE(SUM(i.amount), 0), COUNT(i) FROM Income i WHERE i.user.id = :userId AND i.date BETWEEN :from AND :to AND i.category IS NULL AND (:walletId IS NULL OR i.wallet.id = :walletId)")
    List<Object[]> findUncategorizedTotals(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("walletId") Long walletId);
}
