package com.expenses.budget.internal;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    @EntityGraph(attributePaths = {"category", "wallet"})
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
           "AND (:walletId IS NULL OR b.wallet.id = :walletId) ORDER BY b.id")
    List<Budget> findByUserIdAndOptionalWallet(@Param("userId") Long userId, @Param("walletId") Long walletId);

    @EntityGraph(attributePaths = {"category", "wallet"})
    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category", "wallet"})
    Optional<Budget> findByUserIdAndCategoryIdAndWalletId(Long userId, Long categoryId, Long walletId);

    @Modifying
    @Query("UPDATE Budget b SET b.deletedAt = :now " +
           "WHERE b.user.id = :userId AND b.wallet.id = :walletId AND b.deletedAt IS NULL")
    int softDeleteByWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId, @Param("now") LocalDateTime now);
}
