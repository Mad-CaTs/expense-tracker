package com.expenses.expense;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(
        Long id,
        BigDecimal amount,
        String description,
        LocalDate date,
        Long categoryId,
        String notes,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        int attachmentCount,
        Long walletId,
        String walletName) {
}
