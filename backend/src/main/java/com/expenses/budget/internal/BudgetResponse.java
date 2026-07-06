package com.expenses.budget.internal;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        Long walletId,
        String walletName,
        BigDecimal amount,
        BigDecimal spent,
        double percentage) {
}
