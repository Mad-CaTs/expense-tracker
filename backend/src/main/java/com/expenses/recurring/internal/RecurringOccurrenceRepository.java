package com.expenses.recurring.internal;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RecurringOccurrenceRepository extends JpaRepository<RecurringOccurrence, Long> {

    @EntityGraph(attributePaths = {"recurring", "recurring.category", "recurring.wallet"})
    List<RecurringOccurrence> findByUserIdAndStatusOrderByDueDateAsc(Long userId, OccurrenceStatus status);

    @EntityGraph(attributePaths = {"recurring", "recurring.category", "recurring.wallet"})
    List<RecurringOccurrence> findByUserIdAndRecurringIdOrderByDueDateDesc(Long userId, Long recurringId);

    @EntityGraph(attributePaths = {"recurring", "recurring.category", "recurring.wallet"})
    Optional<RecurringOccurrence> findByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("UPDATE RecurringOccurrence o SET o.status = com.expenses.recurring.internal.OccurrenceStatus.SKIPPED, " +
           "o.updatedAt = :now WHERE o.recurring.id = :recurringId AND o.userId = :userId " +
           "AND o.status = com.expenses.recurring.internal.OccurrenceStatus.PENDING AND o.deletedAt IS NULL")
    int skipPendingByRecurringId(@Param("recurringId") Long recurringId, @Param("userId") Long userId,
                                 @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE RecurringOccurrence o SET o.status = com.expenses.recurring.internal.OccurrenceStatus.SKIPPED, " +
           "o.updatedAt = :now WHERE o.status = com.expenses.recurring.internal.OccurrenceStatus.PENDING " +
           "AND o.deletedAt IS NULL AND o.recurring.id IN " +
           "(SELECT r.id FROM RecurringExpense r WHERE r.wallet.id = :walletId AND r.user.id = :userId)")
    int skipPendingByWalletId(@Param("userId") Long userId, @Param("walletId") Long walletId,
                              @Param("now") LocalDateTime now);
}
