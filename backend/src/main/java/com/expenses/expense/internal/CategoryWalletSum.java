package com.expenses.expense.internal;

import java.math.BigDecimal;

public interface CategoryWalletSum {
    Long getCategoryId();
    Long getWalletId();
    BigDecimal getTotal();
}
