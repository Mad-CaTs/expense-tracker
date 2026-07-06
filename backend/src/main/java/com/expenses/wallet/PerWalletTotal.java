package com.expenses.wallet;

import java.math.BigDecimal;

public interface PerWalletTotal {
    Long getWalletId();
    BigDecimal getTotal();
}
