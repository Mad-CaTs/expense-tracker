package com.expenses.income.internal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record IncomeResponse(
        Long id,
        BigDecimal amount,
        String description,
        LocalDate date,
        String notes,
        Long walletId,
        String walletName,
        Long categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        LocalDateTime createdAt) {
}
