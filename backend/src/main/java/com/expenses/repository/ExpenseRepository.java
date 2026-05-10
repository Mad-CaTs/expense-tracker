package com.expenses.repository;

import com.expenses.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    Page<Expense> findByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to, Pageable pageable);

    Page<Expense> findByUserIdAndDateBetweenAndCategoryId(Long userId, LocalDate from, LocalDate to, Long categoryId, Pageable pageable);

    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to);

    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.date BETWEEN :from AND :to")
    BigDecimal sumAmountByUserIdAndDateBetween(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
        SELECT e.category.name, SUM(e.amount), COUNT(e)
        FROM Expense e
        WHERE e.user.id = :userId AND e.date BETWEEN :from AND :to
        GROUP BY e.category.name
        ORDER BY SUM(e.amount) DESC
        """)
    List<Object[]> findCategoryBreakdownByUserId(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
