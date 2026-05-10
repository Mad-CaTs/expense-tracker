package com.expenses.repository;

import com.expenses.entity.ExpenseAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExpenseAttachmentRepository extends JpaRepository<ExpenseAttachment, Long> {
    List<ExpenseAttachment> findByExpenseId(Long expenseId);
    Optional<ExpenseAttachment> findByIdAndExpenseUserIdAndExpenseId(Long id, Long userId, Long expenseId);
}
