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
        String currency,
        /** false si la billetera ya tiene movimientos: la moneda queda fijada. */
        boolean currencyLocked,
        Long backgroundId,
        String backgroundUrl) {
}
