package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import com.expenses.debt.DebtStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DebtResponse(
        Long id,
        DebtDirection direction,
        String personName,
        BigDecimal amount,
        BigDecimal paidAmount,
        BigDecimal pending,
        DebtStatus status,
        Long expenseId,
        Long walletId,
        String description,
        LocalDate incurredOn,
        LocalDate settledOn
) {}
