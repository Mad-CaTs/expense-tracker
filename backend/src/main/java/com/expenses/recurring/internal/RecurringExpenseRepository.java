package com.expenses.recurring.internal;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {

    @EntityGraph(attributePaths = {"category", "wallet"})
    @Query("SELECT r FROM RecurringExpense r WHERE r.user.id = :userId " +
           "AND (:walletId IS NULL OR r.wallet.id = :walletId) ORDER BY r.id")
    List<RecurringExpense> findByUserIdAndOptionalWallet(@Param("userId") Long userId, @Param("walletId") Long walletId);

    @EntityGraph(attributePaths = {"category", "wallet"})
    Optional<RecurringExpense> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category", "wallet", "user"})
    List<RecurringExpense> findByActiveTrueAndNextDateLessThanEqual(LocalDate date);

    @Modifying
    @Query("UPDATE RecurringExpense r SET r.deletedAt = :now " +
           "WHERE r.user.id = :userId AND r.wallet.id = :walletId AND r.deletedAt IS NULL")
    int softDeleteByWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId, @Param("now") LocalDateTime now);
}
