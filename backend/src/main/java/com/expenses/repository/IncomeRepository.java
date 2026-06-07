package com.expenses.repository;

import com.expenses.entity.Income;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    Page<Income> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate from, LocalDate to, Pageable pageable);

    Page<Income> findByUserIdAndWalletIdAndDateBetweenOrderByDateDesc(Long userId, Long walletId, LocalDate from, LocalDate to, Pageable pageable);

    Optional<Income> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId AND i.date BETWEEN :from AND :to")
    BigDecimal sumAmountByUserIdAndDateBetween(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
