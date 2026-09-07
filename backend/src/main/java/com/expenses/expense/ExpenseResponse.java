package com.expenses.expense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
        String walletName,
        /** Parte que deben otros; 0 en un gasto normal. */
        BigDecimal reimbursableAmount,
        LocalDateTime createdAt) {
}
