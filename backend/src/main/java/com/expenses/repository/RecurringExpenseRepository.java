package com.expenses.repository;

import com.expenses.entity.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {

    List<RecurringExpense> findByUserId(Long userId);

    Optional<RecurringExpense> findByIdAndUserId(Long id, Long userId);

    List<RecurringExpense> findByActiveTrueAndNextDateLessThanEqual(LocalDate date);
}
