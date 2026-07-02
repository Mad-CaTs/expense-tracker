package com.expenses.repository;

import com.expenses.entity.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {

    @Query("SELECT r FROM RecurringExpense r WHERE r.user.id = :userId " +
           "AND (:walletId IS NULL OR r.wallet.id = :walletId)")
    List<RecurringExpense> findByUserIdAndOptionalWallet(@Param("userId") Long userId, @Param("walletId") Long walletId);

    Optional<RecurringExpense> findByIdAndUserId(Long id, Long userId);

    List<RecurringExpense> findByActiveTrueAndNextDateLessThanEqual(LocalDate date);
}
