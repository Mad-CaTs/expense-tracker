package com.expenses.transfer.internal;

import com.expenses.wallet.PerWalletTotal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransferRepository extends JpaRepository<Transfer, Long> {

    Page<Transfer> findByUserIdOrderByDateDescCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT t FROM Transfer t WHERE t.user.id = :userId " +
           "AND (t.fromWallet.id = :walletId OR t.toWallet.id = :walletId)")
    Page<Transfer> findByUserIdAndWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId, Pageable pageable);

    Optional<Transfer> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transfer t WHERE t.user.id = :userId AND t.toWallet.id = :walletId")
    BigDecimal sumIncomingByUserIdAndWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transfer t WHERE t.user.id = :userId AND t.fromWallet.id = :walletId")
    BigDecimal sumOutgoingByUserIdAndWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId);

    @Query("SELECT t.toWallet.id AS walletId, SUM(t.amount) AS total FROM Transfer t " +
           "WHERE t.user.id = :userId GROUP BY t.toWallet.id")
    List<PerWalletTotal> sumIncomingByUserIdGroupedByWallet(@Param("userId") Long userId);

    @Query("SELECT t.fromWallet.id AS walletId, SUM(t.amount) AS total FROM Transfer t " +
           "WHERE t.user.id = :userId GROUP BY t.fromWallet.id")
    List<PerWalletTotal> sumOutgoingByUserIdGroupedByWallet(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Transfer t SET t.deletedAt = :now WHERE t.user.id = :userId " +
           "AND (t.fromWallet.id = :walletId OR t.toWallet.id = :walletId) AND t.deletedAt IS NULL")
    int softDeleteByWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId, @Param("now") LocalDateTime now);
}
