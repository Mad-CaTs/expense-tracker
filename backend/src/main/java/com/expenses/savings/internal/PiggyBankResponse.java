package com.expenses.savings.internal;

import java.math.BigDecimal;

/** Una alcancía con lo que tiene guardado ahora. */
public record PiggyBankResponse(Long id, Long walletId, String name, BigDecimal balance) {
}
