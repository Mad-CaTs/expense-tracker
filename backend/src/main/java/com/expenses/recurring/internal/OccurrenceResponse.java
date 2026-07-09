package com.expenses.recurring.internal;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OccurrenceResponse(
        Long id,
        Long recurringId,
        LocalDate dueDate,
        String status,
        BigDecimal amount,
        Long expenseId,
        String description,
        Long categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        Long walletId,
        String walletName) {
}
