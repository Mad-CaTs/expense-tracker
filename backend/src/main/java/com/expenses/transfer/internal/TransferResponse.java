package com.expenses.transfer.internal;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransferResponse(
        Long id,
        BigDecimal amount,
        String description,
        LocalDate date,
        Long fromWalletId,
        Long toWalletId,
        String fromWalletName,
        String toWalletName,
        String createdAt) {
}
