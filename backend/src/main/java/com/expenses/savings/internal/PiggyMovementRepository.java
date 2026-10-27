package com.expenses.savings.internal;

import com.expenses.wallet.PerWalletTotal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface PiggyMovementRepository extends JpaRepository<PiggyMovement, Long> {

    /** Total por alcancía y tipo dentro de una billetera; el neto lo arma el servicio. */
    interface PiggyTypeTotal {
        Long getPiggyBankId();
        PiggyMovementType getType();
        BigDecimal getTotal();
    }

    List<PiggyMovement> findByUserIdAndPiggyBankIdOrderByMovedOnDescIdDesc(Long userId, Long piggyBankId);

    List<PiggyMovement> findByUserIdAndWalletIdAndMovedOnBetweenOrderByMovedOnDescIdDesc(
            Long userId, Long walletId, LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(m.amount), 0) FROM PiggyMovement m "
         + "WHERE m.user.id = :userId AND m.piggyBankId = :piggyBankId AND m.type = :type")
    BigDecimal sumByPiggyAndType(@Param("userId") Long userId,
                                 @Param("piggyBankId") Long piggyBankId,
                                 @Param("type") PiggyMovementType type);

    @Query("SELECT m.piggyBankId AS piggyBankId, m.type AS type, SUM(m.amount) AS total FROM PiggyMovement m "
         + "WHERE m.user.id = :userId AND m.wallet.id = :walletId GROUP BY m.piggyBankId, m.type")
    List<PiggyTypeTotal> sumByWalletGroupedByPiggyAndType(@Param("userId") Long userId,
                                                          @Param("walletId") Long walletId);

    @Query("SELECT COALESCE(SUM(m.amount), 0) FROM PiggyMovement m "
         + "WHERE m.user.id = :userId AND m.wallet.id = :walletId AND m.type = :type")
    BigDecimal sumByWalletAndType(@Param("userId") Long userId,
                                  @Param("walletId") Long walletId,
                                  @Param("type") PiggyMovementType type);

    @Query("SELECT COALESCE(SUM(m.amount), 0) FROM PiggyMovement m "
         + "WHERE m.user.id = :userId AND m.wallet.id = :walletId AND m.type = :type AND m.movedOn <= :cutoff")
    BigDecimal sumByWalletAndTypeUpTo(@Param("userId") Long userId,
                                      @Param("walletId") Long walletId,
                                      @Param("type") PiggyMovementType type,
                                      @Param("cutoff") LocalDate cutoff);

    @Query("SELECT m.wallet.id AS walletId, SUM(m.amount) AS total FROM PiggyMovement m "
         + "WHERE m.user.id = :userId AND m.type = :type GROUP BY m.wallet.id")
    List<PerWalletTotal> sumGroupedByWallet(@Param("userId") Long userId,
                                            @Param("type") PiggyMovementType type);

    boolean existsByUserIdAndWalletId(Long userId, Long walletId);

    @Modifying
    @Query("UPDATE PiggyMovement m SET m.deletedAt = :now WHERE m.user.id = :userId "
         + "AND m.wallet.id = :walletId AND m.deletedAt IS NULL")
    void softDeleteByWalletId(@Param("userId") Long userId,
                              @Param("walletId") Long walletId,
                              @Param("now") LocalDateTime now);
}
