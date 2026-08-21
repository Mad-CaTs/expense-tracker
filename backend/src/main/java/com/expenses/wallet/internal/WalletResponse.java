package com.expenses.wallet.internal;

import java.math.BigDecimal;

public record WalletResponse(
        Long id,
        String name,
        BigDecimal initialBalance,
        BigDecimal balance,
        String color,
        String icon,
        String leather,
        Long backgroundId,
        String backgroundUrl) {
}
