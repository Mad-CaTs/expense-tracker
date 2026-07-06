package com.expenses.expense.internal.attachment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExpenseAttachmentRepository extends JpaRepository<ExpenseAttachment, Long> {
    List<ExpenseAttachment> findByExpenseIdAndStatus(Long expenseId, AttachmentStatus status);
    Optional<ExpenseAttachment> findByIdAndExpenseUserIdAndExpenseId(Long id, Long userId, Long expenseId);
}
