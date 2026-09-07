package com.expenses.debt.internal;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Un abono concreto: cuánto, cuándo y a qué billetera entró. */
public record DebtPaymentResponse(
        Long id,
        BigDecimal amount,
        LocalDate paidOn,
        Long walletId,
        String walletName
) {}
