package com.expenses.recurring.internal;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringExpenseResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        Long walletId,
        String walletName,
        BigDecimal amount,
        String description,
        String frequency,
        LocalDate startDate,
        LocalDate nextDate,
        boolean active) {
}
